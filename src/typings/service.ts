import { FindOptionsWhere } from "typeorm";

export interface IPaginationData<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface IPaginationDataFunctionProps<T> {
  page?: number;
  pageSize?: number;
  relations?: boolean;
  where?: FindOptionsWhere<T>[] | FindOptionsWhere<T>
}
export type IPaginationDataFunction<T> = (props: IPaginationDataFunctionProps<T>) => Promise<IPaginationData<T>>