import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// custom metrics — separate from k6's defaults, so we can see auth
// failures and business-logic failures distinctly, not just HTTP status
const authFailureRate = new Rate("auth_failures");
const patientsRequestDuration = new Trend("patients_request_duration");

const BASE_URL = "http://localhost:4000/api/v1";
const LOGIN_EMAIL = "admin@hslclinic.test";
const LOGIN_PASSWORD = "changeme123";

export const options = {
  scenarios: {
    ramping_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 100 },
        { duration: "1m", target: 100 },

        { duration: "30s", target: 500 },
        { duration: "2m", target: 500 },

        { duration: "1m", target: 1000 },
        { duration: "3m", target: 1000 }, // Hold at max 1,000 users for 3 mins

        { duration: "2m", target: 0 }, // Ramp down gracefully to 0
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests must complete under 500ms
    http_req_failed: ["rate<0.01"], // less than 1% of requests may fail
    auth_failures: ["rate<0.01"],
  },
};

// runs ONCE before the load test starts, not per-VU — this is where we
// log in and get a token to share across every virtual user
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD }),
    { headers: { "Content-Type": "application/json" } },
  );

  check(loginRes, {
    "login succeeded": (r) => r.status === 200,
  });

  const accessToken = loginRes.json("accessToken");
  if (!accessToken) {
    throw new Error(
      "Setup failed: could not obtain access token. Check credentials and BASE_URL.",
    );
  }

  return { accessToken };
}

// runs repeatedly, once per virtual user per iteration — this is the
// actual load being generated
export default function (data) {
  const res = http.get(`${BASE_URL}/patients`, {
    headers: {
      Authorization: `Bearer ${data.accessToken}`,
    },
  });

  patientsRequestDuration.add(res.timings.duration);

  const success = check(res, {
    "status is 200": (r) => r.status === 200,
    "response has patients array": (r) => Array.isArray(r.json("patients")),
    "response time < 800ms": (r) => r.timings.duration < 800,
  });

  authFailureRate.add(res.status === 401 || res.status === 403);

  if (!success) {
    console.error(`Unexpected response: ${res.status} - ${res.body}`);
  }

  sleep(1); // pause between iterations, simulating real user think-time
}
