
package ntua.thesis.dis.importing.converter;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;
import java.util.Map.Entry;


import org.apache.commons.codec.EncoderException;
import org.apache.commons.codec.net.URLCodec;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class JSONToRDFConverter implements Converter {

        private URLCodec urlCoder = new URLCodec();

        private String datasetName;
        private String baseURI;
        private String datasetURI;
        private File inputFile;
        private File outputFile;
        private String customizedVocPrefix;
        private String[] datasetPrefixes;
        private String recordClass;
        private String datasetClass;
      
        private String[] columnsInTTLFormat;

        private ArrayList<String> cellClasses = new ArrayList<String>();
       
        public void setBaseURI(String baseUri){
                this.baseURI = baseUri;
        };
        
        public void setDatasetName(String name){
                this.datasetName = name;
        };
        
        public void setOutputFile(File file){
                this.outputFile = file;
        };
        
        public void setInputFile(File file){
                this.inputFile = file;
        };
        
        public void setCustomizedVocabularyPrefix(String prefix){
                this.customizedVocPrefix = prefix;
        }
        
        public void setDatasetPrefixes(HashMap<String,String> prefixes){
                
                Set<Entry<String, String>> prefixesCollecion = prefixes.entrySet();
                
                Iterator<Entry<String, String>> it = prefixesCollecion.iterator();
                int i = 0;
                Entry<String,String> entry = null;
                datasetPrefixes = new String[prefixes.size()];
                while (it.hasNext()){
                        entry = it.next();
                        datasetPrefixes[i] = "@prefix"+ " " + entry.getKey() + ":" + "<" + entry.getValue() + ">"; 
                        i++;
                }
        }
        
        public void setRecordClass(String recordClass) {
                this.recordClass = recordClass;
        }
        
        public void setDatasetClass(String datasetClass) {
                this.datasetClass = datasetClass;
        }
        
        public void convert() throws JSONException, EncoderException, IOException{
               
                Path path = null;
                OutputStream out = null;
            
                try {
                        path = outputFile.toPath();
                        out = Files.newOutputStream(path, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                   
                } catch (IOException e1) {
                        
                        e1.printStackTrace();
                }
                
              
                String line = "";
                Charset charset = Charset.forName("UTF-8");
                try (BufferedReader reader = Files.newBufferedReader(inputFile.toPath(), charset)) {
                    String l = "";
                    while ((l = reader.readLine()) != null) {
                            line+=l;
                            System.out.println(line);
                    }
                } catch (IOException x) {
                    System.err.format("IOException: %s%n", x);
                }
                
                formDatasetURI();
                
                /*step 1 : add necessary dataset prefixes */
                for(int i = 0; i < datasetPrefixes.length; i++){
                        out.write((datasetPrefixes[i]+'.' + "\n").getBytes());
                }
                
                /*step 2 : add dataset statement */
                out.write((getDatasetStatement()+"\n").getBytes());
                
                /*step 3 : initialization for the main body of statements */
                
                JSONArray data = new JSONArray(line);
                String subject = "";
                String predicate = "";
                String object = "";
                String statement = "";
               
                JSONObject row = data.getJSONObject(0);
                
                //Iterator<JSONObject> it = row.keys();
                JSONArray columnsInJSON = row.names();
                
                String[] columnNames = new String[columnsInJSON.length()];
                
            
                for(int i = 0;i < columnsInJSON.length();i++){
                        columnNames[i] = columnsInJSON.getString(i);
                }
                
                columnNames = createValidColumnNames(columnNames); // valid names for ttl format
        
                
                String[] ttlColumns = convertColumnsToTTLFormat(columnNames);
                
                
                //columnsInTTLFormat = new String[ttlColumns.length+1];
                columnsInTTLFormat = ttlColumns;
                
                String[] columnsLiterals = new String[row.length()];
                
                
                
                
                
                int k = 0;
                int col = 0;
                for(int i = 0; i < data.length(); i++){
                        row = data.getJSONObject(i);
                        subject = convertRow(i);
                        
                        /* step 3a : write subject and rdf:type statement */
                        statement+=(subject+"\n");
                        
                        statement+=(getRowTypeStatement()+";\n");
                        
                        /* step 3b : write predicate and object statements for each property */
                        Iterator<?> keys = row.keys();
                        k = 0;
                        col = 0;
                        while (keys.hasNext()){
                                
                                String column = keys.next().toString();
                                //System.out.println("in json convert column name > "+column);
                                if (!row.getString(column).equals("")){
                                    predicate = ttlColumns[col];
                                    statement+=(predicate+ " ");
                                    object = convertColumnValue(i,column,row.getString(column));
                                    statement+=(object+";\n");
                                   // System.out.println("predicate > "+predicate);
                                    columnsLiterals[k] = createColumnLiteralStatement(object,row.getString(column),predicate);
                                    k++;  
                                }
                                col++;
                        }
                        statement+=".\n";
                        
                        /* step 3c : write literals for each not null object */
                        for(k = 0 ; k < columnsLiterals.length; k++){
                                if (columnsLiterals[k]!=null){
                                        statement+=(columnsLiterals[k]+"\n");
                                }
                        }
                        
                        out.write(statement.getBytes());
                        statement = "";
                }
                
                out.close();
        }
  
        
        /******************************* USEFUL METHODS **********************************************/
        private String createColumnLiteralStatement(String object, String value,String predicate) {
                
                
                String statement = null;
                int intValue = 0;
                double doubleValue = 0.0d;
                float floatValue = 0.0f;
                
                value = value.replace('\n',' ');
                value = value.replace('\"', '\'');
                
                
                try{
                        intValue = Integer.parseInt(value);
                        statement = object + customizedVocPrefix + ":hasValue" + " " + "\"" + intValue + "\"" + "^^<http://www.w3.org/2001/XMLSchema#integer>"+".";
                        return statement;
                }catch (NumberFormatException e){
                        //
                }
                
                try{
                        doubleValue = Double.parseDouble(value);
                        statement = object + customizedVocPrefix + ":hasValue" + " " + "\"" + doubleValue + "\"" + "^^<http://www.w3.org/2001/XMLSchema#double>"+".";
                        return statement;
                }catch (NumberFormatException e){
                        //
                }
                
                try{
                        floatValue = Float.parseFloat(value);
                        statement = object + customizedVocPrefix + ":hasValue" + " " + "\"" + floatValue + "\"" + "^^<http://www.w3.org/2001/XMLSchema#float>"+".";
                        return statement;
                }catch (NumberFormatException e){
                        //
                }
                
                if(value.equals("true") || value.equals("false")){
                        statement = object + customizedVocPrefix + ":hasValue" + " " + "\"" + value + "\"" + "^^<http://www.w3.org/2001/XMLSchema#boolean>"+".";
                        return statement;
                }
                
                statement = object + customizedVocPrefix + ":hasValue" + "\""+ value + "\""+".";//";"+"\n"+
                                   //" rdf:type " + predicate+"Cell" + "."; 
                //this.cellClasses.add(predicate+"Cell");
                return statement ;
        }

        private String convertRow(int rowNumber) {

                String subjectURI = "<" + datasetURI + "/" + "rowID/"+ rowNumber + ">";
                return subjectURI;
        }

        private String convertColumn(String columnName) throws EncoderException {

                String predicateURI = customizedVocPrefix + ":" + urlCoder.encode(columnName);
                return predicateURI;
        }

        private String convertColumnValue(int rowNumber, String columnName, String cellValueToString) throws EncoderException {

                String objectURI = "<" + datasetURI + "/rowID/" + rowNumber + "/" + urlCoder.encode(columnName) + "/" + urlCoder.encode(cellValueToString) + ">";
                return objectURI;
        }
        
        private void formDatasetURI(){
                datasetURI = baseURI + datasetName;
          
        }
        
        private String getDatasetStatement() {
                return ("<" + datasetURI + ">" + " " + "rdf:type" + " " + customizedVocPrefix + ":" + datasetClass + ".");   
        }
        
        public String getRowTypeStatement() {
                return ("rdf:type" + " " + customizedVocPrefix + ":" + recordClass);
        }
        
        private String[] createValidColumnNames(String columns[]){
                
                String[] validProperties = new String[columns.length];
                for(int i = 0; i < columns.length;i++){
                        //columns[i] = filterColumnName(columns[i]);
                        validProperties[i] = filterColumnName(columns[i]);        
                }
                
                return validProperties;
        }
        
        private String[] convertColumnsToTTLFormat(String[] columns) throws EncoderException{
                
                
                String[] triplifiedColumns = new String[columns.length];
                for(int i = 0; i < columns.length; i++){
                        triplifiedColumns[i] = convertColumn(columns[i]);
                }
                
                return triplifiedColumns;
        }
        
        
        private String filterColumnName(String columnName){
                
            
                char[] dst = new char[columnName.length()];
                columnName.getChars(0, columnName.length(), dst, 0);
               
                if (!isValidNameStartChar(dst[0])){
                        dst[0] = '_';
                }
                
                for(int i = 1; i < dst.length; i++){
                        if (!isValidNameChar(dst[i])){
                               dst[i] = '_'; 
                        }
                }
                String newColumnName = new String(dst);
                return newColumnName;
        }
        
        private boolean isValidNameChar(char c){
                
                if (isValidNameStartChar(c)){
                        return true;
                }
                if ( (c == '-') || (c >= '0' && c <= '9')){
                        return true;
                }
                String charToHex = Integer.toHexString(c | 0x10000).substring(1);
                
                if (charToHex.compareTo("00B7") == 0){
                        return true;
                }
                
                if (charToHex.compareTo("0300")>=0 && charToHex.compareTo("036F")<=0){
                        return true; 
                }
                else if (charToHex.compareTo("203F")>=0 && charToHex.compareTo("2040")<=0){
                         return true; 
                }
                
                return false;
        }
        
        private boolean isValidNameStartChar(char c){
                
                String charToHex1 = Integer.toHexString(c | 0x10000).substring(1);
                String charToHex2 = Integer.toHexString(c | 0x100000).substring(1);
                
                //int intChar = Integer.parseInt(String.valueOf(c));
                
                if(c>='0' && c <='9'){
                        
                        return true;
                }
                
                if ((c>='A' && c<='Z') || (c>='a' && c<='z') || (c == '_') ){
                        return true; 
                }
                
                if (charToHex1.compareTo("00C0")>=0 && charToHex1.compareTo("00D6")<=0){
                       return true; 
                }
                else if (charToHex1.compareTo("00D8")>=0 && charToHex1.compareTo("00F6")<=0){
                        return true; 
                }
                else if (charToHex1.compareTo("00F8")>=0 && charToHex1.compareTo("02FF")<=0){
                        return true; 
                }
                else if (charToHex1.compareTo("0370")>=0 && charToHex1.compareTo("037D")<=0){
                        return true; 
                }
                else if (charToHex1.compareTo("037F")>=0 && charToHex1.compareTo("1FFF")<=0){
                        return true; 
                }
                else if (charToHex1.compareTo("200C")>=0 && charToHex1.compareTo("200D")<=0){
                        return true; 
                }
                else if (charToHex1.compareTo("2070")>=0 && charToHex1.compareTo("218F")<=0){
                        return true; 
                }
                else if (charToHex1.compareTo("2C00")>=0 && charToHex1.compareTo("2FEF")<=0){
                        return true; 
                }
                else if (charToHex1.compareTo("3001")>=0 && charToHex1.compareTo("D7FF")<=0){
                        return true; 
                }
                else if (charToHex1.compareTo("F900")>=0 && charToHex1.compareTo("FDCF")<=0){
                        return true; 
                }
                else if (charToHex1.compareTo("FDF0")>=0 && charToHex1.compareTo("FFFD")<=0){
                        return true; 
                }
                
                if (charToHex2.compareTo("10000")>=0 && charToHex1.compareTo("EFFFF")<=0){
                        return true; 
                }
                
                return false;
        }
        /******************************************************************************************************/

        @Override
        public String[] getRDFProperties() {
                
           /*     System.out.println("length is " + columnsInTTLFormat.length);
                
                int left_arrow_pos = datasetPrefixes[2].indexOf('<');
                int right_arrow_pos = datasetPrefixes[2].indexOf('>');
                String prefix_value = datasetPrefixes[2].substring(left_arrow_pos+1, right_arrow_pos);*/
                //String[] fullRDFProperties = new String[columnsInTTLFormat.length];
                //columnsInTTLFormat[columnsInTTLFormat.length-1] = "rdf:type";
                
                String[] result = new String[columnsInTTLFormat.length+1];
                for(int i = 0; i < columnsInTTLFormat.length;i++){
                        result[i] = columnsInTTLFormat[i];
                }
                result[columnsInTTLFormat.length] = customizedVocPrefix + ":hasValue";
                
                //columnsInTTLFormat[columnsInTTLFormat.length] = customizedVocPrefix + ":hasValue";
                return result;
        }
        @Override
        public String[] getRDFClasses() {
                
                String[] rdfClasses= new String[2];
              
                /*int left_arrow_pos = datasetPrefixes[2].indexOf('<');
                int right_arrow_pos = datasetPrefixes[2].indexOf('>');
                String prefix_value = datasetPrefixes[2].substring(left_arrow_pos+1, right_arrow_pos);
                
                fullRDFClasses[0] = prefix_value + "dataset";
                fullRDFClasses[1] = prefix_value + recordClass;*/
                
                rdfClasses[0] = customizedVocPrefix + ":" + datasetClass;
                rdfClasses[1] = customizedVocPrefix +":"+ recordClass;
                for(int i = 0; i < this.cellClasses.size();i++){
                        rdfClasses[i+2] = this.cellClasses.get(i);
                }
                
                
                return rdfClasses;
        }   
}
