package ntua.thesis.dis.tests;
import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import ntua.thesis.dis.util.SPARQLUtils;

import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.hp.hpl.jena.query.Dataset;
import com.hp.hpl.jena.query.DatasetFactory;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ReadWrite;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.sparql.core.DatasetGraph;
import com.hp.hpl.jena.tdb.TDBFactory;
import com.hp.hpl.jena.util.FileManager;
import com.hp.hpl.jena.util.LocationMapper;




public class JenaTest1 {

        public static void createGraphs(){
                
                FileManager fm = FileManager.get();
                
               
                
                fm.loadModel("file:C:/Users/John/Desktop/data/testRDF.rdf");
                fm.loadModel("file:C:/Users/John/Desktop/data/output.ttl");
                
                LocationMapper locMap = fm.getLocationMapper();
                
                locMap.addAltEntry("http://localhost:8080/DSpace/graphName1","file:C:/Users/John/Desktop/data/testRDF.rdf" );
                locMap.addAltEntry("http://localhost:8080/DSpace/graphName2","file:C:/Users/John/Desktop/data/output.ttl");
                
                
                List<String> list = new ArrayList<String>();
                list.add("http://localhost:8080/DSpace/graphName1");
                list.add("http://localhost:8080/DSpace/graphName2");
                
              
                
                Dataset dataspace = DatasetFactory.createNamed(list, fm);
                
                Iterator<String> it = dataspace.listNames();
                
               
               
                String namedGraph = "";
                while (it.hasNext()){
                        namedGraph = it.next();
                        System.out.println(namedGraph);
                        System.out.println(dataspace.getNamedModel(namedGraph).size());
                }
                
                StringBuilder builder = new StringBuilder();
                builder.append("PREFIX tab:<http://localhost:8080/tab/data/TabularDef#>");
                builder.append("PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>");
               // builder.append("PREFIX data:<file:///C:/Users/John/thesis_workspace/DataIntegrationTool/>");
                builder.append("SELECT " +
                               "?graph ?count "+
                               "FROM NAMED <http://localhost:8080/DSpace/graphName1>"+
                               "FROM NAMED <http://localhost:8080/DSpace/graphName2>"+ 
                               "FROM NAMED <file:///C:/Users/John/thesis_workspace/DataIntegrationTool/testRDF.rdf>"+
                               "FROM NAMED <file:///C:/Users/John/thesis_workspace/DataIntegrationTool/output.ttl>"+ 
                               "WHERE{" +
                                       "GRAPH ?graph {" +
                                       "SELECT (count(?s) AS ?count)"+
                                       "WHERE {?s ?p ?o}" +
                                       "}" +
                               "}" 
                              );
               /* builder.append("SELECT " +
                                "?s ?graph "+
                                "FROM NAMED <http://localhost:8080/DSpace/graphName1>"+
                                "FROM NAMED <http://localhost:8080/DSpace/graphName2>"+ 
                                "where{"+
                                "GRAPH <http://localhost:8080/DSpace/graphName2> {" +
                                
                                "?s rdf:type ?o" +
                                "}" +
                                "}" 
                                
                                
                               );*/
                
                
                //globalMemoryDataset.begin(ReadWrite.READ) ;
                System.out.println(builder.toString());
                Query query = QueryFactory.create(builder.toString()) ;
                QueryExecution qexec = QueryExecutionFactory.create(query, dataspace) ;
                //System.out.println("in transaction "+globalMemoryDataset.isInTransaction());
                try {
                  ResultSet results = qexec.execSelect() ;
                  for ( ; results.hasNext() ; )
                  {
                          QuerySolution soln = results.nextSolution();
                          System.out.println(soln.toString());
                         
                  }
                  
                  
                  //System.out.println("in transaction "+globalMemoryDataset.isInTransaction());
                 // System.out.println("results are "+results.hasNext());
                  //JSONArray resultsJSON = SPARQLUtils.getSPARQLQueryResultsInJSON(results);
                  //System.out.println(resultsJSON.toString());
                
                } finally { qexec.close() ; }
        }
        
        public static void main(String[] args) throws IOException {
               
                createGraphs();
              /* VocabularyExtractor vocEx = new VocabularyExtractor();
               File file1 = Paths.get("C:/Users/John/Desktop/data", "output.ttl").toFile();
               vocEx.readData(file1);
               Model model1 = vocEx.getModel();
               
               File file2 = Paths.get("C:/Users/John/Desktop/data", "testRDF.rdf").toFile();
               vocEx.readData(file2);
               Model model2 = vocEx.getModel();*/
               
           /*    System.out.println(System.getProperty("user.home").toString()); 
               String userHomeDir = System.getProperty("user.home");
               
               String workspaceDir = userHomeDir+"\\"+"DSpace";
               
               System.out.println(new File(workspaceDir).mkdir());
               
               File projectsDir = Paths.get(workspaceDir).toFile();
               
               File[] projectsFiles = projectsDir.listFiles();
               for(int i = 0; i < projectsFiles.length;i++){
                       System.out.println(projectsFiles[i].getName());
                       String name = projectsFiles[i].getName();
                       long id = Long.parseLong(name.split(".dataspace")[0]);
                       System.out.println(id);
               } */
                
               //System.out.println("user home dir "+this.workspaceDir.toString()); 
               
                
                
              
                
               
             /*  FileManager globalFileMan = FileManager.get();
               globalFileMan.addLocatorFile("C:/Users/John/Desktop/data/");
               globalFileMan.loadModel("file:testRDF.rdf");
               globalFileMan.loadModel("file:output.ttl");
               Model model1 = globalFileMan.loadModel("testRDF.rdf", "file:C:/Users/John/Desktop/data/","RDF/XML");
               Model model2 = globalFileMan.loadModel("output.ttl", "file:C:/Users/John/Desktop/data/","TTL");
               
               
               model = model.union(model1).union(model2);
               //System.out.println("model1 is "+model1);
               String directory = "C:/Users/John/Desktop/globalDataset" ; 
               FileUtils.deleteDirectory(Paths.get(directory).toFile());
               Dataset globalDataset = TDBFactory.createDataset(directory);
               
               List<String> list = new ArrayList<String>();
               list.add("file:testRDF.rdf");
               list.add("file:output.ttl");
               //globalDataset.createNamed(list, globalFileMan);
               
               System.out.println(TDBFactory.isBackedByTDB(globalDataset));*/
               //globalDataset.begin(ReadWrite.WRITE);
            /*   globalDataset.addNamedModel("http://localhost:8080/graphName1", model1);
               globalDataset.addNamedModel("http://localhost:8080/graphName2", model2);
               
               Iterator<String> it = globalDataset.listNames();
               String namedGraph = "";
               while (it.hasNext()){
                       namedGraph = it.next();
                       System.out.println(namedGraph);
                       System.out.println(globalDataset.getNamedModel(namedGraph).size());
               }*/
               
              /* System.out.println(globalDataset.getNamedModel("graphName1").size());
               System.out.println(globalDataset.getNamedModel("graphName1").size());*/
              
               /*1st way*/
              
               String dir = "C:/Users/John/Desktop/data/dataspaces/dataspace1";
               Dataset dataspace = TDBFactory.createDataset(dir);
               
               Model dataspaceModel = dataspace.getDefaultModel();
               
               //dataspaceModel.
               /* 2nd way */
              //createGraphs();
               
              // globalMemoryDataset.commit();
              // System.out.println("in transaction "+globalMemoryDataset.isInTransaction());
        }
        
        
        
        /* List<String> namedSourceList = new ArrayList<String>();
        namedSourceList.add("file:C:/Users/John/Desktop/data/testRDF.rdf");
        namedSourceList.add("file:C:/Users/John/Desktop/data/output.ttl");*/
        
        //Dataset globalMemoryDataset =  DatasetFactory.create(list, namedSourceList, globalFileMan, "C:/Users/John/Desktop/data/");
        //Dataset dataspace = DatasetFactory.createNamed(list, globalFileMan);
        
}
