import prisma from "../../config/prisma";

interface ListFilters {
  dentistId?: string;
  status?: string;
  from?: Date;
  to?: Date;
}
