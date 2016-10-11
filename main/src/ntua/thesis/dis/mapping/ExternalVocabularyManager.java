package ntua.thesis.dis.mapping;

import java.io.DataOutputStream;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import ntua.thesis.dis.importers.VocabularyExtractor;
import ntua.thesis.dis.util.ProjectFileUtils;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
/*import org.apache.commons.io.FileUtils;*/
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.ResIterator;
import com.hp.hpl.jena.rdf.model.Resource;



public class ExternalVocabularyManager {
        
        private HashMap<String,JSONObject> vocabularyNsToVocabularyMap = new HashMap<String,JSONObject>();
        private String vocabulariesDir;
        private String DATA_CUBE_VOCABULARY = "http://publishing-statistical-data.googlecode.com/svn/trunk/specs/src/main/vocab/cube.ttl";
        private String FOAF_VOCABULARY = "http://xmlns.com/foaf/spec/index.rdf";
        private String DBPEDIA_VOCABULARY = "http://xmlns.com/foaf/spec/index.rdf";
        private HashMap<String,String> prefixToUriMap = new HashMap<String,String>();
        
        
        public ExternalVocabularyManager(String vocabulariesDir){
                this.vocabulariesDir = vocabulariesDir;
                /*System.out.println("voc man "+this.vocabulariesDir);
                
                JSONObject qbVoc = new JSONObject();
                qbVoc = this.downloadVocabulary(this.DATA_CUBE_VOCABULARY);
                try {
                        qbVoc.put("name", "Data Cube Vocabulary");
                        this.importVocabulary("qb", qbVoc);
                        System.out.println(qbVoc.toString());
                } catch (JSONException|NullPointerException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
                JSONObject foafVoc = this.downloadVocabulary(this.FOAF_VOCABULARY);
                try {
                        foafVoc.put("name", "Foaf Vocabulary");
                        this.importVocabulary("foaf", foafVoc);
                        System.out.println(foafVoc.toString());
                } catch (JSONException|NullPointerException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }*/
                
        }
        
        
        public JSONObject importVocabulary(HttpServletRequest request){
                
                JSONObject vocabulary = new JSONObject();
                String vocabularyName = request.getParameter("vocabularyName");
                File file;
                try {
                        file = this.uploadVocabulary(request);
                        if(file!=null){
                                VocabularyExtractor vocEx = new VocabularyExtractor();
                                vocEx.readVocabulary(file);
                                Model model = vocEx.getModel();
                                vocabulary.put("terms",this.getVocabularyTerms(model));
                                vocabulary.put("name",vocabularyName);
                                vocabulary.put("source",ProjectFileUtils.getFilename(file.toString()));
                                this.vocabularyNsToVocabularyMap.put(file.toString(),vocabulary);
                                System.out.println("vocabulary prefixes map > "+model.getNsPrefixMap().toString());
                                this.prefixToUriMap.putAll(model.getNsPrefixMap()); 
                              
                        }
                } catch (FileUploadException | IOException | JSONException e) {
                        e.printStackTrace();
                        return vocabulary;
                }
                return vocabulary;
                
        }
        
        
        public JSONObject importVocabulary(String vocabularyName,String vocabularyURL){
                System.out.println("addVocabulary "+vocabularyName);
                JSONObject vocabulary = this.downloadVocabulary(vocabularyName,vocabularyURL);
                
                if(vocabulary.length() > 0){
                        System.out.println("vocabulary is "+vocabulary.toString());
                        try {
                                vocabulary.put("name",vocabularyName);
                                vocabulary.put("source",vocabularyURL);
                                System.out.println(vocabulary.toString());
                                this.vocabularyNsToVocabularyMap.put(vocabularyURL,vocabulary);
                        } catch (JSONException e) {
                                e.printStackTrace();
                        }
                }
                return vocabulary;
        }
        
        private File uploadVocabulary(HttpServletRequest request) throws FileUploadException{
                
                DiskFileItemFactory factory = new DiskFileItemFactory();
                factory.setRepository(Paths.get(this.vocabulariesDir).toFile());
                ServletFileUpload upload = new ServletFileUpload(factory);
                upload.setSizeMax(10000000);
                File uploadedFile = null;
                List<FileItem> items = upload.parseRequest(request);
                Iterator<FileItem> iter = items.iterator();
                
                while (iter.hasNext()) {
                    FileItem item = iter.next();

                    if (!item.isFormField()) {

                        String fileName = item.getName();
                        uploadedFile = Paths.get(this.vocabulariesDir +"/"+fileName).toFile();
                        try {
                                item.write(uploadedFile);
                        } catch (Exception e) {          
                                e.printStackTrace();
                                return uploadedFile;
                        }
                    }
                } 
                
                return uploadedFile;
        }
        
        
        
       /* private void importVocabulary(String prefix,JSONObject vocabulary){
                
                if(vocabulary!=null){
                        this.vocabularyNsToVocabularyMap.put(prefix,vocabulary);
                }
        }*/
        
        public JSONObject getVocabulary(String prefix){
                return this.vocabularyNsToVocabularyMap.get(prefix);
        }
        
        public Set<Entry<String, JSONObject>> getAllVocabularies(){
                return this.vocabularyNsToVocabularyMap.entrySet();
        }
        
        private JSONObject downloadVocabulary(String vocabularyName,String vocabularyUrl){
                
                JSONObject vocabularyJSON = new JSONObject();
                URL url;
                URLConnection connection = null;  
                File file = null;
                try {
                  //Create connection
                      url = new URL(vocabularyUrl);
                      
                      connection = url.openConnection();
                      
                      //connection.addRequestProperty("method", "POST");//setRequestMethod("POST");
                      connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
                            
                      connection.setRequestProperty("Content-Length", "" );
                      connection.setRequestProperty("Content-Language", "en-US");  
                            
                      connection.setUseCaches(false);
                      connection.setDoInput(true);
                      connection.setDoOutput(true);
    
                      //Send request
                      DataOutputStream wr = new DataOutputStream (
                                  connection.getOutputStream ());
                      //wr.writeBytes (urlParameters);
                      wr.flush ();
                      wr.close ();

                  //Get Response    
                          //InputStream is = connection.getInputStream();
                      String resultURL = connection.getURL().toString(); //in case of redirection
                      System.out.println(resultURL);
                      System.out.println(vocabularyName);
                      file = Paths.get(this.vocabulariesDir,vocabularyName).toFile();
                      System.out.println(file.toString());
                      ProjectFileUtils.copyURLToFile(new URL(resultURL), file);
                      
                      /*//Model model = SPARQLUtils.readRdfFile(file);
                      VocabularyExtractor vocEx = new VocabularyExtractor();
                      vocEx.readVocabulary(file);
                      Model model = vocEx.getModel();
                      vocabularyJSON.put("terms",this.getVocabularyTerms(model));
                      this.prefixToUriMap.putAll(model.getNsPrefixMap());*/
                      if(isValidVocabularyFile(resultURL)){
                              String filename = getFileName(resultURL);
                              file = Paths.get(this.vocabulariesDir,filename).toFile();
                              ProjectFileUtils.copyURLToFile(new URL(resultURL), file);
                              
                              System.out.println(file.getPath());
                              VocabularyExtractor vocEx = new VocabularyExtractor();
                              vocEx.readVocabulary(file);
                              Model model = vocEx.getModel();
                              
                              vocabularyJSON.put("terms",this.getVocabularyTerms(model));
                              //vocabularyJSON.put("classes",this.getVocabularyClasses(model));
                              //vocabularyJSON.put("properties",this.getVocabularyProperties(model));
                              //this.prefixToUriMap.clear();
                              this.prefixToUriMap.putAll(model.getNsPrefixMap());
                              //System.out.println("prefixes from vocabulary are "+vocEx.getPrefixes().toString());
                      }else{
                              vocabularyJSON = null;
                      }
                } catch (Exception e) {
                        e.printStackTrace();
                        return vocabularyJSON;
                } finally {
                        System.out.println("finally");
                        if(connection != null) {
                            try {
                                    connection.connect();
                                    return vocabularyJSON;
                            } catch (IOException e) {
                                    // TODO Auto-generated catch block
                                    e.printStackTrace();
                            } 
                        }    
                }
                return null;
                
        }

        private JSONArray getVocabularyTerms(Model model) {
                
                ResIterator it = model.listSubjects();
                JSONArray terms = new JSONArray();
                Resource termRes = null;
                while(it.hasNext()){
                        termRes = it.next();
                        if(termRes.isURIResource()){
                                terms.put(termRes.toString());
                        }
                }
                return terms;
        }


        /*private JSONArray getVocabularyProperties(Model model) {
                
                JSONArray properties = new JSONArray();
                StringBuilder queryString = new StringBuilder();
               
                queryString.append("PREFIX "+ "rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n");
                queryString.append( "SELECT ?x WHERE {?x a rdf:Property}");
                                    
                Query query = QueryFactory.create(queryString.toString()) ;
                QueryExecution qexec = QueryExecutionFactory.create(query, model) ;
                try {
                  ResultSet results = qexec.execSelect() ;
                  for ( ; results.hasNext() ; )
                  {
                    QuerySolution soln = results.nextSolution() ;
           
                    RDFNode x = soln.get("x");   
                    properties.put(x.toString());
                   // System.out.println(x.toString());
                  }
                } finally { qexec.close() ; }
                
                return properties;
        }*/


       /* private JSONArray getVocabularyClasses(Model model) {
                
                JSONArray classes = new JSONArray();
                StringBuilder queryString = new StringBuilder();
                
                queryString.append("PREFIX "+ "rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n");
                queryString.append("PREFIX "+ "owl:<http://www.w3.org/2002/07/owl#>\n");
                queryString.append( "SELECT ?x WHERE {?x a rdfs:Class, owl:Class}");
                                    
                Query query = QueryFactory.create(queryString.toString()) ;
                QueryExecution qexec = QueryExecutionFactory.create(query, model) ;
                try {
                  ResultSet results = qexec.execSelect() ;
                  for ( ; results.hasNext() ; )
                  {
                    QuerySolution soln = results.nextSolution() ;
           
                    RDFNode x = soln.get("x") ;  
                    classes.put(x.toString());
                    //System.out.println("class " +x.toString());
                  }
                } finally { qexec.close() ; }
                
                return classes;
        }*/


        private static String getFileName(String resultURL) {
                String afterLastSlashString = resultURL.substring(resultURL.lastIndexOf('/')+1);
                System.out.println(afterLastSlashString);
                return afterLastSlashString;
        }


        private static boolean isValidVocabularyFile(String resultURL) {

                if(resultURL.contains(".ttl")){
                        return true;
                }
                if(resultURL.contains(".rdf")){
                        return true;
                }
                if(resultURL.contains(".xml")){
                        return true;
                }
                return false;
        }


        public HashMap<String, String> getPrefixes() {
              
                return this.prefixToUriMap;
        }
        
        
      /*  public HashMap<String,Integer> getVocabulary(Model model) throws IOException {
               
                this.prefixToUriMap.clear();
                this.prefixToUriMap.putAll(model.getNsPrefixMap());
                HashMap<String,Integer> vocabulary = new HashMap<String,Integer>();
                Map<String,String> prefixesMap = model.getNsPrefixMap();
                StmtIterator it = model.listStatements();
                Statement statement;
                System.out.println("model prefixes = "+model.getNsPrefixMap().toString());
                while (it.hasNext()) {
                        statement = it.next();
                        if(statement.getSubject().getNameSpace()!=null){
                                if(prefixesMap.containsValue(statement.getSubject().getNameSpace())){
                                        
                                        
                                        statement.getObject().toString();
                                        
                                        
                                        if(!vocabulary.containsKey(statement.getSubject().toString())){
                                                vocabulary.put(statement.getSubject().toString(), 1);
                                        }
                                        //System.out.println(statement.getSubject().getNameSpace().toString());
                                       
                                }  
                        }
                }
                //System.out.println(vocabulary.toString());
                return vocabulary;
        }
        */
     
        
}
