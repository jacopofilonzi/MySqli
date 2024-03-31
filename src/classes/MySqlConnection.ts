import { AuthType } from "../types/AuthType";
import mysql from "mysql";
import { QueryResultType } from "../types/QueryResultType";
import { ExecuteQueryProps } from "../types/ExecuteQueryProps";

export class MySqlConnection {
    private credentials: AuthType | undefined = undefined;
    private connection: mysql.Connection | undefined = undefined;

    /**
     *
     * @param {AuthType} credentials Credentials to access the database
     */
    constructor(credentials: AuthType) {
        this.credentials = credentials;

        this.connection = mysql.createConnection({
            host: this.credentials.host,
            user: this.credentials.username,
            password: this.credentials.password,
            database: this.credentials.database,
        });
    }

    /**
     * Create a connection to the database
     */
    private createConnection(): void {
        if (this.credentials === undefined)
            throw new Error("Credentials not set");

        this.connection = mysql.createConnection({
            host: this.credentials.host,
            user: this.credentials.username,
            password: this.credentials.password,
            database: this.credentials.database,
        });
    }

    /**
     * Connect to the database
     */
    private async connect(): Promise<number | null> {
        if (this.connection === undefined) this.createConnection();

        if (this.connection === undefined)
            throw new Error(
                "Impossible to connect to database, maybe credentials are wrong"
            );

        return new Promise<number | null>((resolve, reject) => {
            this.connection!.connect((err) => {
                if (err)
                    reject(
                        new Error(`Error connecting to database: ${err.stack}`)
                    );

                resolve(this.connection!.threadId);
            });
        });
    }

    /**
     * Disconnect from the database
     */
    private async disconnect(): Promise<void> {
        if (this.connection === undefined)
            throw new Error(
                "Impossible to disconnect from database, connection is undefined"
            );

        return new Promise<void>((resolve, reject) => {
            this.connection!.end((err) => {
                if (err)
                    reject(
                        new Error(
                            `Error disconnecting from database: ${err.stack}`
                        )
                    );

                resolve();
            });
        });
    }

    /**
     * Execute a query
     * @param {string} query Query to execute
     * @param {ExecuteQueryProps} [props] Props to execute the query
     * @returns {Promise<QueryResultType>} Query result
     */
    async executeQuery(query: string, {params = [], multiple = false}: ExecuteQueryProps = {}): Promise<QueryResultType> {
        if (this.connection === undefined) this.createConnection();

        //if connection is closed
        if (this.connection!.state === "disconnected") await this.connect();

        return new Promise<any>((resolve, reject) => {
            this.connection!.query(
                query,
                params,
                async (err, results, fields) => {
                    if (err) {
                        reject(
                            new Error(`Error executing query: ${err.stack}`)
                        );
                    }

                    //Disconnect from db if not needed to execute multiple queries
                    if (!multiple) await this.disconnect();

                    //Return the results
                    resolve({ results, fields });
                }
            );
        });
    }
}
