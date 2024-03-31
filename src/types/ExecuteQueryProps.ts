/**
 * ExecuteQueryType
 * 
 * This type is used to define the parameters that are passed to the executeQuery function.
 * 
 * @param {any[]} params The parameters to pass to the query
 * @param {boolean} multiple If needed to execute multiple queries in a short time
 */
export type ExecuteQueryProps = {
    params?: any[];
    multiple?: boolean;
}