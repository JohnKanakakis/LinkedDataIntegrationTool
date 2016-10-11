package ntua.thesis.dis.tests;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Iterator;

import org.apache.commons.codec.EncoderException;
import org.apache.commons.validator.routines.*;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;



import au.com.bytecode.opencsv.CSVReader;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.query.ResultSetFormatter;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Resource;

import de.fuberlin.wiwiss.r2r.FileOrURISource;
import de.fuberlin.wiwiss.r2r.Source;

import ntua.thesis.dis.dataspace.Dataset;
import ntua.thesis.dis.importers.ExcelParser;
import ntua.thesis.dis.importers.VocabularyExtractor;
import ntua.thesis.dis.importing.SourcesManager;
import ntua.thesis.dis.importing.converter.JSONToRDFConverter;
import ntua.thesis.dis.importing.converter.TabularToRDFConverter;
import ntua.thesis.dis.importing.source.DBConnectionSource;
import ntua.thesis.dis.mapping.Mapping;
import ntua.thesis.dis.service.FileManager;



public class Test {

        /**
         * @param args
         * @throws SQLException 
         * @throws ClassNotFoundException 
         * @throws IllegalAccessException 
         * @throws InstantiationException 
         * @throws JSONException 
         * @throws IOException 
         * @throws EncoderException 
         */
        public void executeSPARQLquery() throws IOException{
                
                String sparqlQueryString1= "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>"+
                                           "CONSTRUCT {?x skos:hasTopConcept ?y} WHERE{ ?x skos:hasTopConcept ?y}";


                                  Query query = QueryFactory.create(sparqlQueryString1);
                                  QueryExecution qexec = QueryExecutionFactory.sparqlService("http://worldbank.270a.info/sparql", query);

                                  Model model= qexec.execConstruct();
                                  
                                  /*Path outputPath = null;
                                  OutputStream out = null;
                              
                                  try {
                                          outputPath = Files.createTempFile(null, ".ttl");
                                          out = Files.newOutputStream(outputPath, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                                     
                                  } catch (IOException e1) {
                                          // TODO Auto-generated catch block
                                          e1.printStackTrace();
                                  }*/
                                  qexec.close();
                                  VocabularyExtractor vocEx = new VocabularyExtractor();
                                  vocEx.setModel(model);
                                  //Path path = Paths.get("C:/Users/John/Desktop/data/sparqlDataset1.ttl");
                                  //File file = path.toFile();
                                  //vocEx.readData(file);
                                  System.out.println(vocEx.getClassesToString().length);
                                  System.out.println( vocEx.getPropertiesToString()[0]);
                                
                                  //ResultSetFormatter.asText(results);//("Turtle", results);//(model,true);//toModel(results);
                                  
                                  //ResultSetFormatter.outputAsJSON(out,results);       
                                 //Iterator it = model.listStatements();
                                 
                                  //model.write(out,"TTL");
                                 
                                  
                                
                                
        }
        
        public void csvRead() throws IOException{
                
                CSVReader reader = new CSVReader(new FileReader("C:/Users/John/Desktop/data/data.csv"),',');
                String [] nextLine;
               
                
                String[] columnNames = reader.readNext();
                for (int i = 0; i < columnNames.length; i++){
                        System.out.print(columnNames[i].toString() + " ");
                }
                System.out.println("values");
                while ((nextLine = reader.readNext()) != null) {
                      
                    // nextLine[] is an array of values from the line
                    for (int i = 0; i < nextLine.length; i++){
                            System.out.print(nextLine[i].toString() + " ");
                    }
                    System.out.print("\n");
                    
                }
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
        
        private boolean isValidNameStartChar(char c){
                
                String charToHex1 = Integer.toHexString(c | 0x10000).substring(1);
                String charToHex2 = Integer.toHexString(c | 0x100000).substring(1);
                
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
        
        public void connectTodb() throws InstantiationException, IllegalAccessException, ClassNotFoundException, SQLException{
                String url = "jdbc:mysql://localhost/";
                String schema = "sakila";
                String username = "root";
                String password = "1234";
                
                SourcesManager sm = new SourcesManager(null);
                DBConnectionSource dbc = new DBConnectionSource();
                
                dbc.setConnection(url,schema,username,password);
                File newFile = sm.getJSONFileForQuery();
                try {
                        dbc.submitQuery("select * from sakila.address;", newFile);
                } catch (IOException | JSONException | EncoderException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                dbc.close();
        }
        
        public void tabularToRDF(){
                TabularToRDFConverter t = new TabularToRDFConverter();
                t.setBaseURI("http://localhost:8080/");
                t.setCustomizedVocabularyPrefix("rdb");
                t.setDatasetName("DatasetName");
                t.setRecordClass("databaseRecord");
                String[] prefixes = {"@prefix rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
                                     "@prefix rdfs:<http://www.w3.org/2000/01/rdf-schema#>",
                                     "@prefix rdb:<http://localhost:8080/rdb/schema/SchemaDef#>" 
                                    };
                //t.setDatasetPrefixes(prefixes);
                
            
                Path outputPath = Paths.get("C:/Users/John/Desktop/data/newfile1.ttl");
            
                Path path = Paths.get("C:/Users/John/Desktop/data/data.csv");
                File file = path.toFile();
                
                t.setInputFile(path.toFile());
                t.setOutputFile(outputPath.toFile());
                
                try {
                        t.convert();
                } catch (IOException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                Source fileSource = new FileOrURISource(outputPath.toFile().toString());
                
        }
        
        public void rdf(){
                VocabularyExtractor vocEx = new VocabularyExtractor();
                Path path = Paths.get("C:/Users/John/Desktop/data","testRDF.rdf");
                try {
                        vocEx.readData(path.toFile());
                        vocEx.getRDFClasses();
                        vocEx.getRDFProperties();
                        String[] prop = vocEx.getPropertiesToString();
                        String[] clas = vocEx.getClassesToString();
                        for(int i = 0; i<prop.length;i++){
                                System.out.println(prop[i]);
                        }
                        System.out.println("---------------");
                        for(int i = 0; i<clas.length;i++){
                                System.out.println(clas[i]);
                        }
                        
                } catch (IOException | JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
        }
        
       
        
       
        public void prefix(String pr){

               int pos = 0; 
               if(pr.indexOf('#') == -1){
                       pos = pr.lastIndexOf('/');
               }
               else{
                       pos = pr.lastIndexOf('#');  
               }
               
               String rdfLink = pr.substring(0, pos+1);
               String[] schemes = {"http","https"};
               UrlValidator urlValidator = new UrlValidator(UrlValidator.ALLOW_LOCAL_URLS);
               
               System.out.println(pr);
               if (urlValidator.isValid(pr)) {
                       System.out.println("url is valid");
               } else {
                       System.out.println("url is invalid");
               }
        }
        
       
        
        
        public static void main(String[] args) throws InstantiationException, IllegalAccessException, ClassNotFoundException, SQLException, IOException, JSONException, EncoderException {
                // TODO Auto-generated method stub
                
                HashMap<String,String> prefixesMap = new HashMap<String,String>();
                prefixesMap.put("key1", "value1");
                String[][] array = new String[1][2];
                array[0][0] = "key1";
                array[0][1] = "value1";
                JSONArray jarray = new JSONArray(array);
                System.out.println(jarray.toString());
                Test t = new Test();
                
                //t.tokens();
                //t.prefix("http://localhost:8080/acco#...my/ns/property1");
               // t.rdf();
                //t.connectTodb();
               // t.tabularToRDF();
                t.executeSPARQLquery();
                //t.csvRead();
               /* String name = "John1({%percentage_@something})";
                System.out.println(t.filterColumnName(name));
                System.out.println(Integer.toHexString(name.charAt(2) | 0x10000).substring(1));
                String characterToHex =  Integer.toHexString('%' | 0x10000).substring(1);
                System.out.println(characterToHex);
                System.out.println((characterToHex.compareTo("0030")>=0 && characterToHex.compareTo("0039")<=0));*/
                /*long time1 = System.currentTimeMillis();
                SourcesManager sm = new SourcesManager(null);
                
                String databaseURL = "jdbc:mysql://localhost/";
                String schema  = "sakila";
                String username = "root";
                String password = "1234";
                DBConnectionSource dbc = new DBConnectionSource();

                try {
                        dbc.setConnection(databaseURL,schema, username, password);
                } catch (InstantiationException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                } catch (IllegalAccessException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                } catch (ClassNotFoundException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
                String query = "SELECT * FROM SAKILA.ADDRESS;";
                File newFile = sm.getJSONFileForQuery();
                dbc.submitQuery(query,null);
                JSONArray res = dbc.getQueryInfo().getJSONArray("data");
                String data = res.toString();
                Path path = null;
                OutputStream out = null;
            
                try {
                        path = newFile.toPath();
                        out = Files.newOutputStream(path, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                   
                } catch (IOException e1) {

                        e1.printStackTrace();
                }
                
                out.write(data.getBytes());
                out.close();
                
                JSONToRDFConverter c = new JSONToRDFConverter();
                c.setBaseURI("http://localhost:8080/");
                c.setCustomizedVocabularyPrefix("rdb");
                c.setDatasetName("DatasetName");
                c.setRecordClass("databaseRecord");
                String[] prefixes = {"@prefix rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
                                     "@prefix rdfs:<http://www.w3.org/2000/01/rdf-schema#>",
                                     "@prefix rdb:<http://localhost:8080/rdb/schema/SchemaDef#>" 
                                    };
                c.setDatasetPrefixes(prefixes);
                
                Path outputPath = null;
                out = null;
            
                try {
                        outputPath = Files.createTempFile(null, ".ttl");
                        out = Files.newOutputStream(outputPath, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                   
                } catch (IOException e1) {
                        // TODO Auto-generated catch block
                        e1.printStackTrace();
                }
                c.setInputFile(path.toFile());
                c.setOutputFile(outputPath.toFile());
                
                File outputFile = c.convert();
                Source fileSource = new FileOrURISource(outputFile.toString());
                //JSONArray data1 = new JSONArray(c.convert());
                
                
                
                
                Path path1 = Paths.get("C:/Users/John/AppData/Local/Temp/Data Integration Tool/datasets/test.json");
                File file1 = path1.toFile();
                
                System.out.println(file1.toString());
                JSONToRDFConverter c1 = new JSONToRDFConverter();
                c1.setBaseURI("http://localhost:8080/");
                c1.setCustomizedVocabularyPrefix("tab");
                c1.setDatasetName("DatasetName");
                c1.setRecordClass("tabularRecord");
                String[] prefixes1 = {"@prefix rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
                                      "@prefix rdfs:<http://www.w3.org/2000/01/rdf-schema#>",
                                      "@prefix tab:<http://localhost:8080/tab/myfile/TabularDef#>" 
                                     };
                c1.setDatasetPrefixes(prefixes1);
                
                Path outputPath1 = null;

            
                try {
                        outputPath1 = Files.createTempFile(null, ".ttl");     
                } catch (IOException e1) {
                        // TODO Auto-generated catch block
                        e1.printStackTrace();
                }
                c1.setInputFile(file1);
                c1.setOutputFile(outputPath1.toFile());
                
                File outputFile1 = c1.convert();
                Source fileSource1 = new FileOrURISource(outputFile1.toString());
                
                long time2 = System.currentTimeMillis();
                System.out.println(time2-time1);*/
                
                
                
                /*ExcelParser ex = new ExcelParser();
                
                Path path = Paths.get("C:/Users/John/Desktop/data/data.xls");
                File file = path.toFile();
                long time1 = System.currentTimeMillis();
                File outFile = ex.convertToRDF(file);
                
                Source fileSource = new FileOrURISource(outFile.toString());
                long time2 = System.currentTimeMillis();
                System.out.println(time2-time1);*/
                /*SourcesManager sm  = new SourcesManager(null); 
                String query = "some text";
                String result = "some string";
                File newFile = sm.createFileFromQuery(query,result);
                String pathToString = newFile.toPath().toString();
                System.out.println(pathToString.toString());
                int filenamePos = pathToString.lastIndexOf('\\')+ 1;
                String filename = pathToString.substring(filenamePos);
                System.out.println(filename);*/
                //String extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length());
                //System.out.println(pathToString+"-"+filenamePos+"-"+filename+"-"+extension);
                /*FileManager fm = new FileManager();
                
                Path path = fm.createFile("data.xls");
                File file = path.toFile();
                ExcelParser exc = new ExcelParser();
                
                exc.convert(file);
                SourcesManager pm = new SourcesManager();
                
                String baseUrl = "jdbc:mysql://localhost/";
                String schema  = "sakila";
                String username = "root";
                String pass = "1234";
                String datasetName = "myDataset";
                String query = "SELECT * FROM SAKILA.ADDRESS AS ADDRESS, SAKILA.CITY AS CITY, SAKILA.COUNTRY AS COUNTRY WHERE ADDRESS.CITY_ID = CITY.CITY_ID AND CITY.COUNTRY_ID = COUNTRY.COUNTRY_ID;";
                DBConnectionSource dbc = new DBConnectionSource();
                dbc.setConnection(baseUrl,schema, username, pass);
                
                
                dbc.submitQuery(query,datasetName);
                dbc.close();
                
                String data = dbc.getRDFData();
                
                Path tempFile = pm.getPath(data, ".ttl");
                Source fileSource = new FileOrURISource(tempFile.toString());
                System.out.println("valid ttl");*/
               /* if (dbc.convertResultsToRDF(query,file,datasetName)<0){
                        
                        //response.sendError(500, "An error occured with the database connection");
                };*/
                
                //JSONToRDFConverter rc = new JSONToRDFConverter(dbc.resultSet,file,schema,datasetName);
             /*   Dataset dataset = new Dataset();
                
                dataset.setFileDir("C://dit/file1.csv");
                dataset.setID(7);
                dataset.setName("file1.csv");
                
                Dataset dataset1 = new Dataset();
                
                dataset1.setFileDir("C://mynewfiledir/file2.csv");
                dataset1.setID(8);
                dataset1.setName("file2.csv");
                
                pm.importDataset(dataset1);
                
                Dataset ds1 = pm.getDatasetByName("file2.csv");*/
                
                //ystem.out.println("fileDir: "+ds1.getFileDir());
        }

}
