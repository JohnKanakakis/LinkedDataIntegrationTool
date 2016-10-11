package ntua.thesis.dis.tests;

import java.io.ByteArrayOutputStream;
import java.io.Console;
import java.io.File;
import java.io.IOException;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hp.hpl.jena.query.QueryParseException;

import de.fuberlin.wiwiss.r2r.FileOrURISource;
import de.fuberlin.wiwiss.r2r.Mapper;
import de.fuberlin.wiwiss.r2r.NTriplesOutput;
import de.fuberlin.wiwiss.r2r.Output;
import de.fuberlin.wiwiss.r2r.Repository;
import de.fuberlin.wiwiss.r2r.Source;
import de.fuberlin.wiwiss.silk.Silk;

import ntua.thesis.dis.dataspace.Dataset;
import ntua.thesis.dis.importing.SourcesManager;
import ntua.thesis.dis.linking.LinkingManager;
import ntua.thesis.dis.mapping.Mapping;
import ntua.thesis.dis.mapping.SchemaMappingManager;
import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.service.ServiceManager;


public class TestIntegration {

        public static ArrayList<String> getPattern(String pattern){
                ArrayList<String> array = new ArrayList<String>();
                array.add(pattern);
                return array;
        }
        
        
        public static void main(String[] args) throws IOException, JSONException {
                
                //TestIntegration t = new TestIntegration();
                
                ServiceManager service = ServiceManager.getInstance();
                test(service);
              
                
                //File silkfile = Paths.get("C:/Users/John/Desktop/testIntegration/linkFile.xml").toFile();
               // Silk.executeFile(silkfile,"cities",7,true);
        }


        public static void test(ServiceManager service) throws IOException, JSONException {
                
                SourcesManager sm = service.sourcesManager;
                SchemaMappingManager schm = service.schemaMappingManager;
                LinkingManager lm = service.linkingManager;
 
                
                final Logger logger = LoggerFactory.getLogger("Silk");
                
                String file1 = "C:/Users/John/Desktop/testIntegration/Graffiti_Locations.xls";
                String file2 = "C:/Users/John/Desktop/testIntegration/FDNY_Firehouse_Listing.xls";
                
                sm.importFile(file1);
                sm.importFile(file2);
                Dataset dataset1 = sm.convertFile(file1);
                Dataset dataset2 = sm.convertFile(file2);
               
            
                System.out.println("Vocabulary > ");
                dataset1.getVocabulary().print();
                ArrayList<Mapping> propertyMappingList = new ArrayList<Mapping>();
                ArrayList<String> sourcePatterns = null;
                ArrayList<String> targetPatterns = null;
                ArrayList<String> transformPatterns = null;
      
                String sourcePattern = "?SUBJ tab-Graffiti_Locations:Borough ?o.?o tab-Graffiti_Locations:hasValue ?v";
                String targetPattern = "?SUBJ <http://mynamespace/Area> ?o";
                String transformPattern = "";    
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
                targetPatterns.add("?o rdfs:label ?v");
       
                Mapping propMap1 = new Mapping("map1",PrefixesManager.getPrefixToUriMap(),PrefixesManager.getUriToPrefixMap(),false);
                
                propMap1.setSourcePatterns(sourcePatterns);
                propMap1.setTargetPatterns(targetPatterns);
                //propertyMappingList.add(propMap1);
                
                
                
                sourcePattern = "?SUBJ rdf:type tab-Graffiti_Locations:tabularRecord";
                targetPattern = "?SUBJ rdf:type dbpedia:Observation";         
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
                Mapping propMap2 = new Mapping("map2",PrefixesManager.getPrefixToUriMap(),PrefixesManager.getUriToPrefixMap(),false);
                //propertyMappingList.add(propMap2);
                propMap2.setSourcePatterns(sourcePatterns);
                propMap2.setTargetPatterns(targetPatterns);
                
                schm.createMappingTask(dataset1.getName(), "mappingTask1");
                
                schm.addMappingToTask(propMap1, "mappingTask1");
                schm.addMappingToTask(propMap2, "mappingTask1");
                
                JSONObject results;
                
                results =  schm.executeMappingTask("mappingTask1");
                schm.confirmMappingTask("mappingTask1");
                
                
                
                propertyMappingList.clear();
                sourcePatterns.clear();
                targetPatterns.clear();
          
                sourcePattern = "?SUBJ tab-FDNY_Firehouse_Listing:Borough ?o.?o tab-FDNY_Firehouse_Listing:hasValue ?v";
                targetPattern = "?SUBJ <http://mynamespace/Area>  ?o";
                transformPattern = "";    
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
                targetPatterns.add("?o foaf:name ?v");
          
                Mapping propMap3 = null;
                
                try{
                        propMap3 = new Mapping("map3",PrefixesManager.getPrefixToUriMap(),PrefixesManager.getUriToPrefixMap(),false);
                        propMap3.setSourcePatterns(sourcePatterns);
                        propMap3.setTargetPatterns(targetPatterns);
                }catch(QueryParseException e){
                        System.out.println("wrong mapping !!!");
                        System.exit(0);
                }
                
                //propertyMappingList.add(propMap3);
                
                sourcePattern = "?SUBJ rdf:type tab-FDNY_Firehouse_Listing:tabularRecord";
                targetPattern = "?SUBJ rdf:type qb:Observation";         
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
                Mapping propMap4 = new Mapping("map4",PrefixesManager.getPrefixToUriMap(),PrefixesManager.getUriToPrefixMap(),false);
                propMap4.setSourcePatterns(sourcePatterns);
                propMap4.setTargetPatterns(targetPatterns);
                propertyMappingList.add(propMap4);

                schm.createMappingTask(dataset2.getName(), "mappingTask2");
                /*
                if(schm.addMappingToTask(propMap3, "mappingTask2") < 0){
                        System.out.println("wrong mapping !!!");
                        System.exit(0);
                }*/
                schm.addMappingToTask(propMap3, "mappingTask2");
                //schm.addMappingToTask(propMap4, "mappingTask2");
        
                
                
               
                
                
                
                
                results =  schm.executeMappingTask("mappingTask2");
                schm.confirmMappingTask("mappingTask2");
             
                
                
                
                
                
                String interlink =  "{'input':[{'input':[],'elType':'input','elName':'input','params':[{'name':'path','value':'?city1/rdfs:label'}]},{'input':[],'elType':'input','elName':'input','params':[{'name':'path','value':'?city2/foaf:name'}]}],'elType':'comparison','elName':'levenshteinDistance','params':[{'name':'weight','value':'1'},{'name':'required','value':'true'},{'name':'threshold','value':'2'}]}";
                
                //System.out.println(interlink.toString());
                JSONObject linkSpec = new JSONObject(interlink);
                
                JSONObject userInput = new JSONObject();
                
                userInput.put("linkTaskName","testLinkTask");
                userInput.put("sourceRestrictTo","?s rdf:type qb:Observation.?s dbpedia:Area ?city1");
                userInput.put("targetRestrictTo","?s rdf:type qb:Observation.?s dbpedia:Area ?city2");       
                userInput.put("sourceVar","city1");
                userInput.put("targetVar","city2");
                userInput.put("acceptMinConf","0.5");
                userInput.put("acceptMaxConf","1");
                userInput.put("verifyMinConf","0");
                userInput.put("verifyMaxConf","0.5");
                userInput.put("linkSpec",linkSpec);
                System.out.println(lm.createPredefinedLinkingTasks());
                
                
                PrintStream backupSystemOut = System.out;
                
                // redirect the default output to a stream
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                PrintWriter printWriter = new PrintWriter(out);
                Console console = System.console();
           
                
                
                // write something to the stream using
                // the method called System.out.println()
                
                
                lm.createLinkingTask(dataset1.getName(), dataset2.getName(), userInput);
               
                lm.confirmLinkingTask("testLinkTask",new JSONArray());
                
                
                
                //String string = console.readLine();//out.toString();
                
                // restore the stdout and write the String to stdout
                //System.setOut(backupSystemOut);
                //System.out.println("here we go: " + string);
                
                
                
        }
}
