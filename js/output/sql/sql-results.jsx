import React, {Component} from "react";

class SQLResults extends Component {
    render() {
        let schemasHeading, resultsHeading;
        if (this.props.tables) {
            schemasHeading = <h1>Database Schema</h1>;
        }
        if (this.props.results) {
            resultsHeading = <h1>Results</h1>;
        }

        const schemasTables = this.props.tables.map((table) => {
            let rowText = $._("row");
            if (table.columns.length > 1) {
                rowText = $._("rows");
            }
            const columnRows = table.columns.map((column) => (
                <tr key={column.name}>
                    <td>
                        {column.name}
                        {column.pk > 0 && (
                            <span className="schema-pk">(PK)</span>
                        )}
                        <span className="column-type-wrap">
                            <span className="schema-column-type">
                                {column.type}
                            </span>
                        </span>
                    </td>
                </tr>
            ));

            return (
                <table
                    className="sql-schema-table"
                    data-table-name={table.name}
                    key={table.name}
                >
                    <thead>
                        <tr>
                            <th>
                                <a href="javascript:void(0)">{table.name}</a>
                                <span className="row-count">
                                    {table.rowCount} {rowText}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>{columnRows}</tbody>
                </table>
            );
        });

        const resultsTables = this.props.results.map((result, resultInd) => {
            const columnHeaders = result.columns.map((columnName, colInd) => (
                <th key={"col" + colInd}>{columnName}</th>
            ));
            const valuesRows = result.values.map((rowValues, rowInd) => {
                const valuesCells = rowValues.result.map((value, colInd) => (
                    <td key={rowInd + "_" + colInd}>
                        {value.data === null ? "NULL" : value.data}
                    </td>
                ));
                return <tr key={"row" + rowInd}>{valuesCells}</tr>;
            });

            return (
                <table className="sql-result-table" key={"result" + resultInd}>
                    <thead>
                        <tr>{columnHeaders}</tr>
                    </thead>
                    <tbody>{valuesRows}</tbody>
                </table>
            );
        });

        return (
            <div className="sql-output">
                {schemasHeading}
                {schemasTables}
                {resultsHeading}
                {resultsTables}
            </div>
        );
    }
}

module.exports = SQLResults;
