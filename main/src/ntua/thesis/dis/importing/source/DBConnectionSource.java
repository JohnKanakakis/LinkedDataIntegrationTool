
package ntua.thesis.dis.importing.source;


import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Connection;
import org.apache.commons.codec.EncoderException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class DBConnectionSource {

        private Connection connection = null;
        private String connectionURL = null;
        private String schema = null;
        private String userName = null;
        private String password = null;
        private JSONObject queryInfo = new JSONObject();
        
        /*private HashMap <String,RelationalQuery> queries = new HashMap <String,RelationalQuery>();*/
        
        
        
        
        
        public void setConnection(String baseURL, String schema, String userName, String password) throws InstantiationException,
                        IllegalAccessException, ClassNotFoundException, SQLException {

                setConnectionURL(baseURL+schema);
                setSchema(schema);
                setUserName(userName);
                setPassword(password);
                Class.forName("com.mysql.jdbc.Driver").newInstance();
                connection = DriverManager.getConnection(this.connectionURL, this.userName, this.password);
                connection.setAutoCommit(true);
        }

        private void setSchema(String schema) {
               this.schema = schema;
        }

        public void setConnectionURL(String connectionURL) {
                this.connectionURL = connectionURL;
        }

        public void setUserName(String userName) {
                this.userName = userName;
        }

        public void setPassword(String password) {
                this.password = password;
        }
        
        public JSONObject getQueryInfo() {
                return queryInfo;
        }
        
        public String getConnectionURL() {
                return connectionURL;
        }

        
        public String getSchema() {
                return schema;
        }
        
        public JSONArray getMetadata() throws SQLException, JSONException {

                DatabaseMetaData met = connection.getMetaData();
                ResultSet databaseTables = met.getTables(connection.getCatalog(), null, null, null);
                
                JSONArray jsonTables = new JSONArray();
                while (databaseTables.next()) {

                        JSONObject table = new JSONObject();
                        table.put("name", databaseTables.getString(3)); // put
                                                                        // table
                                                                        // name

                        System.out.println("table " + databaseTables.getString(3));

                        ResultSet columnsRS = met.getColumns(connection.getCatalog(), null,
                                                             databaseTables.getString(3), "%");

                        JSONArray columns = new JSONArray();
                        while (columnsRS.next()) {

                                JSONObject col = new JSONObject();
                                col.put("name", columnsRS.getString(4));
                                col.put("dataType", columnsRS.getString(6));

                                columns.put(col);
                        }
                        table.put("columns", columns);

                        ResultSet primKeyRS = met.getPrimaryKeys(connection.getCatalog(), null,
                                                                 databaseTables.getString(3));
                        JSONArray primKey = new JSONArray();

                        while (primKeyRS.next()) {
                                JSONObject pk = new JSONObject();
                                pk.put("pk", primKeyRS.getString(4));

                                primKey.put(pk);

                        }
                        table.put("primaryKeys", primKey);

                        // table.setColumns(col);
                        // table.setPrimaryKey(primKey);
                        ResultSet foreignKeyRS = met.getImportedKeys(connection.getCatalog(), null,  databaseTables.getString(3));
                        JSONArray foreignKeys = new JSONArray();
                        
                        while (foreignKeyRS.next()){
                                JSONObject fk = new JSONObject();
                                fk.put("fk_name", foreignKeyRS.getString(12));
                                fk.put("fk_column", foreignKeyRS.getString(8));
                                fk.put("fk_ref_table", foreignKeyRS.getString(3));
                                foreignKeys.put(fk);
                                System.out.println("foreign key name = "+ foreignKeyRS.getString(12));
                                System.out.println("foreign key column= "+ foreignKeyRS.getString(8));
                                System.out.println("to table = "+foreignKeyRS.getString(3));
                        }
                        table.put("foreignKeys", foreignKeys);
                        
                        jsonTables.put(table);
                        /*
                         * table.setForeignKeys(met.getExportedKeys(this.connection
                         * .getCatalog(), null,tables.getString(3)));
                         * 
                         * dbT.add(table);
                         * 
                         * 
                         * 
                         * while (table.getForeignKeys().next()){
                         * System.out.println("foreign key = "+
                         * table.getForeignKeys().getString(8));
                         * System.out.println
                         * ("to table = "+table.getForeignKeys().getString(7));
                         * }
                         */
                        System.out.println("---------------------------------------------------");

                }


                connection.close();
                return jsonTables;
        }

        public void submitQuery(String query, File file) throws SQLException, IOException, JSONException, EncoderException {
          
                Statement stmt = connection.createStatement();
                ResultSet rs = stmt.executeQuery(query);
                
                JSONObject queryMetadata = new JSONObject();
                
                
                queryMetadata.put("schema", schema);
                
                
                JSONArray queryColumnsMetadata = new JSONArray();
                JSONArray queryResults = new JSONArray();
                //rc = new JSONToRDFConverter(schema,datasetName);
                
                int columns_number = rs.getMetaData().getColumnCount();
                String[][] columns = new String[columns_number][2];

                for (int i = 1; i <= columns_number; i++) {
                        columns[i - 1][0] = rs.getMetaData().getColumnName(i);
                        columns[i - 1][1] = rs.getMetaData().getColumnClassName(i);
                        JSONObject columnMetadata = new JSONObject();
                        columnMetadata.put("name", columns[i - 1][0]);
                        columnMetadata.put("type", columns[i - 1][1]);
                        queryColumnsMetadata.put(columnMetadata);
                }
                queryMetadata.put("columnsMetadata",queryColumnsMetadata);
                
                
                char[] cbuf;
                cbuf = new char[256];
                Reader reader;
                String valueToString = null;
                
            
                
                Path path = null;
                OutputStream out = null;
            
                try {
                        path = file.toPath();
                        out = Files.newOutputStream(path, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                   
                } catch (IOException e1) {

                        e1.printStackTrace();
                }
               
                int num_of_rows = 0;
                
                out.write(("[").getBytes());
                do{
                        
                        boolean writeComma = false;
                        while (rs.next()) {
                                JSONObject row = new JSONObject();
                                
                                if (writeComma){
                                        out.write(',');   
                                }
                                num_of_rows++;
                                for (int col = 1; col <= columns_number; col++) {
                                        
                                        /*converting to json */
                                        reader = rs.getCharacterStream(col);
                                        if (reader != null) {
                                                reader.read(cbuf);
                                                valueToString = new String(cbuf).trim();
                                        } else {
                                                valueToString = "";
                                        }
                                        row.put(columns[col - 1][0], valueToString);

                                        
                                        cbuf = reset(cbuf);
                                }
                                queryResults.put(row);
                                out.write((row.toString()).getBytes());   
                                writeComma = true;
                        }

                        if(!((stmt.getMoreResults() == false) && (stmt.getUpdateCount() == -1))){
                                rs = stmt.getResultSet();
                        }
                }
                while(!((stmt.getMoreResults() == false) && (stmt.getUpdateCount() == -1)));
                
                out.write("]".getBytes());
                out.close();
                queryMetadata.put("rows", num_of_rows);
                queryInfo.put("metadata",queryMetadata);
                queryInfo.put("data",queryResults);
                connection.close();
        }

        /*private String[][] reset(String[][] array) {
               
                for(int k = 0; k < array.length; k++){
                        array[k][0] = null;
                        array[k][1] = null;
                }
                return array;
        }*/

        private char[] reset(char[] array) {
                
                for(int k = 0; k < array.length; k++){
                        array[k] = ' ';
                }
                return array;
        }

        public void close() throws SQLException {
                
                this.connection.close(); 
        }

      /*  public void addQuery(RelationalQuery q) {
                queries.put(q.getValue(),q);
        }*/

}
