export interface IPaginationData<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface IPaginationDataFunctionProps {
  page?: number;
  pageSize?: number;
  relations?: boolean;
}
export type IPaginationDataFunction<T> = (props: IPaginationDataFunctionProps) => Promise<IPaginationData<T>>