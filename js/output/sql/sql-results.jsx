import i18n from "i18n";
import React, {Component} from "react";

class SQLResults extends Component {
    props: {
        tables: Array,
        results: Array,
        onMounted: Function,
    };

    componentDidMount() {
        this.props.onMounted();
    }

    render() {
        let schemasHeading;
        let resultsHeading;
        if (this.props.tables) {
            schemasHeading = <h1 style={styles.h1}>Database Schema</h1>;
        }
        if (this.props.results) {
            resultsHeading = <h1 style={styles.h1}>Results</h1>;
        }

        const schemasTables = this.props.tables.map((table) => {
            let rowText = i18n._("row");
            if (table.columns.length > 1) {
                rowText = i18n._("rows");
            }
            const columnRows = table.columns.map((column) => (
                <tr key={column.name}>
                    <td style={styles.td}>
                        {column.name}
                        {column.pk > 0 && (
                            <span style={styles.schemaPK}>(PK)</span>
                        )}
                        <span style={styles.schemaColumnTypeWrap}>
                            <span style={styles.schemaColumnType}>
                                {column.type}
                            </span>
                        </span>
                    </td>
                </tr>
            ));

            return (
                <table
                    style={{...styles.table, ...styles.schemaTable}}
                    data-table-name={table.name}
                    key={table.name}
                >
                    <thead style={styles.thead}>
                        <tr>
                            <th style={styles.th}>
                                <strong>{table.name}</strong>
                                <span style={styles.schemaRowCount}>
                                    {table.rowCount} {rowText}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody style={styles.tbody}>{columnRows}</tbody>
                </table>
            );
        });

        const resultsTables = this.props.results.map((result, resultInd) => {
            const columnHeaders = result.columns.map((columnName, colInd) => (
                <th key={"col" + colInd} style={styles.th}>{columnName}</th>
            ));
            const valuesRows = result.values.map((rowValues, rowInd) => {
                const valuesCells = rowValues.result.map((value, colInd) => (
                    <td key={rowInd + "_" + colInd} style={styles.td}>
                        {value.data === null ? "NULL" : value.data}
                    </td>
                ));
                return <tr key={"row" + rowInd}>{valuesCells}</tr>;
            });

            return (
                <table key={"result" + resultInd} style={styles.table}>
                    <thead style={styles.thead}>
                        <tr>{columnHeaders}</tr>
                    </thead>
                    <tbody style={styles.tbody}>{valuesRows}</tbody>
                </table>
            );
        });

        return (
            <div>
                {schemasHeading}
                {schemasTables}
                {resultsHeading}
                {resultsTables}
            </div>
        );
    }
}

// Note: We cannot use Aphrodite because it inserts the <style> tag
//  into the parent frame, not the iframe.
const styles = {
    table: {
        borderCollapse: "collapse",
        borderSpacing: 0,
        emptyCells: "show",
        width: "100%",
        marginBottom: "20px",
    },
    schemaTable: {
        float: "left",
        marginRight: "10px",
        width: "auto",
    },
    thead: {
        background: "#e6e6e6",
        color: "#000",
        textAlign: "left",
        verticalAlign: "bottom",
    },
    tbody: {
        border: "1px solid #dbdbdb",
    },
    th: {
        fontFamily: "sans-serif",
        padding: ".4em 1em",
    },
    td: {
        border: "1px solid #eeeeee",
        fontFamily: "Monaco, Menlo, Consolas, monospace",
        fontSize: "inherit",
        margin: 0,
        overflow: "visible",
        padding: ".3em 1em",
    },
    h1: {
        clear: "both",
        color: "#aaa",
        fontFamily: "sans-serif",
        fontSize: "1.1em",
        fontWeight: "normal",
        marginTop: "10px",
        textTransform: "uppercase",
    },
    schemaColumnTypeWrap: {
        float: "right",
        marginLeft: "20px",
        minWidth: "70px",
    },
    schemaColumnType: {
        float: "left",
        color: "#999",
    },
    schemaPK: {
        marginLeft: "8px",
        color: "#999",
    },
    schemaRowCount: {
        color: "#999",
        float: "right",
        marginLeft: "30px",
        textAlign: "right",
        fontWeight: "normal",
    },
};

module.exports = SQLResults;
