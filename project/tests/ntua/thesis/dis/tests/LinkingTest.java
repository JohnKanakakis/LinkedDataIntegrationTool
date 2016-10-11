package ntua.thesis.dis.tests;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import de.fuberlin.wiwiss.silk.Silk;

import ntua.thesis.dis.dataspace.Dataset;
import ntua.thesis.dis.dataspace.DataspaceManager;
import ntua.thesis.dis.dataspace.DatasetVocabulary;
import ntua.thesis.dis.importing.converter.TabularToRDFConverter;
import ntua.thesis.dis.linking.FunctionManager;
import ntua.thesis.dis.linking.LinkingManager;
import ntua.thesis.dis.linking.LinkingTask;
import ntua.thesis.dis.mapping.Mapping;
import ntua.thesis.dis.mapping.SchemaMappingManager;
import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.service.ServiceManager;



public class LinkingTest {

        
        public static JSONObject aggregateObject(String type) throws JSONException{
                
                JSONObject rule = new JSONObject();
                rule.put("nodeType", "Aggregate");
                rule.put("type", type);
                return rule;
                
        }
        
        public static JSONObject compareObject(String metric) throws JSONException{
                
                JSONObject comp4 = new JSONObject();
                comp4.put("nodeType", "Compare");
                comp4.put("metric", metric);
                comp4.put("threshold", 0.8);
                return comp4;
                
        }
        
        public static JSONObject transformationObject(boolean hasParams,String function) throws JSONException{
                
                JSONObject transf1 = new JSONObject();
                
                
                transf1.put("nodeType", "TransformationInput");
                transf1.put("function", function);
                
                if(hasParams){      
                        JSONArray params = new JSONArray();
                        
                        JSONObject param1 = new JSONObject().put("name","search")
                                                           .put("value","%");
                        params.put(param1);
                        
                        JSONObject param2 = new JSONObject().put("name","replace")
                                        .put("value"," ");
                        params.put(param2);
                        transf1.put("params",params);   
                }
                return transf1;
                
        }
        
        public static JSONObject inputObject(String path) throws JSONException{
                
                JSONObject path_o = new JSONObject();
                path_o.put("nodeType", "Input");
                path_o.put("path",path);
                return path_o;
                
        }
        
        
        public static JSONObject test1(String sourcePattern,String targetPattern) throws JSONException{
                
                JSONObject transf1 = transformationObject(true,"replace");
                JSONObject transf2 = transformationObject(false,"lowerCase");
                
                //JSONObject transf3 = transformationObject(false,"stripUriPrefix");
                
                JSONObject path_o1 = inputObject(sourcePattern);
                transf1.put("input", new JSONArray().put(path_o1));
                transf2.put("input", new JSONArray().put(transf1));
                
                
   
                JSONObject transf3 = transformationObject(true,"replace");
                JSONObject transf4 = transformationObject(false,"lowerCase");
                JSONObject path_o2 = inputObject(targetPattern);
                transf3.put("input", new JSONArray().put(path_o2));
                transf4.put("input", new JSONArray().put(transf3));
                
                JSONObject comp = compareObject("levenshteinDistance");
                comp.put("input", new JSONArray().put(transf2).put(transf4));
                
                
                JSONObject aggr = aggregateObject("average");
                aggr.put("input", new JSONArray().put(comp));
                
                return comp;
        }
        
        public static void main(String[] args) throws JSONException, IOException {
                
                ServiceManager service = ServiceManager.getInstance();
                LinkingManager lm = service.linkingManager;
                SchemaMappingManager schMapManager = service.schemaMappingManager;
                DataspaceManager dm = service.getDataspaceManager();
               
                
                                
                TabularToRDFConverter conv = new TabularToRDFConverter();
                
                String fileName = "data.xls";
                File importedDatasetFile = Paths.get("C:/Users/John/Desktop/data",fileName).toFile();
                File exportedFile = Paths.get("C:/Users/John/Desktop/data","output.ttl").toFile();
                
                int format_pos = fileName.lastIndexOf('.');
                
                conv.setDatasetName(fileName.substring(0, format_pos)); 
                conv.setInputFile(importedDatasetFile);
                conv.setOutputFile(exportedFile);
                
                HashMap<String,String> prefixes = new HashMap<String,String>();
                
                prefixes.put("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
                prefixes.put("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
                String prefix = "tab";
                String vocURL = "http://localhost:8080/tab/"+fileName.substring(0, format_pos)+"/TabularDef#";
               
                prefixes.put(prefix,vocURL);
               
                PrefixesManager.addPrefix(prefix, vocURL);
                
                conv.setDatasetPrefixes(prefixes);
                
                conv.setBaseURI("http://localhost:8080/");
                conv.setCustomizedVocabularyPrefix("tab");
                conv.setRecordClass("tabularRecord");
               
                try {
                   conv.convert();
                   
                } catch (IOException e) {
                   // TODO Auto-generated catch block
                   e.printStackTrace();
                }
                  
                DatasetVocabulary vocabulary = new DatasetVocabulary();
                vocabulary.setClasses(conv.getRDFClasses());
                vocabulary.setProperties(conv.getRDFProperties());   
                vocabulary.setPrefixes(prefixes);
                
                vocabulary.print();
                
                
                Dataset dataset = new Dataset("graphName", exportedFile,vocabulary);
                JSONObject importingMetadata = new JSONObject();
                
                importingMetadata.put("Source","file");
                importingMetadata.put("Source Name","myfile.xls");
                importingMetadata.put("Source Description","myfile.xls");
                importingMetadata.put("Type Of Import","file upload");
                importingMetadata.put("Number Of Records",1000);
                System.out.println(importingMetadata.toString());
                dataset.getMetadata().addImportingMetadata(importingMetadata);
                dm.addDataset(dataset);
                
                /*ArrayList<ClassMapping> classMappingList = new ArrayList<ClassMapping>();
                
                String sourcePattern = "?SUBJ rdf:type tab:dataset";
                String targetPattern = "?SUBJ rdf:type qb:Dataset";
                ClassMapping classMap1 = new ClassMapping(sourcePattern, targetPattern);
                classMappingList.add(classMap1);
                
                sourcePattern = "?SUBJ rdf:type tab:tabularRecord";
                targetPattern = "?SUBJ rdf:type qb:Observation";
                ClassMapping classMap2 = new ClassMapping(sourcePattern, targetPattern);
                classMappingList.add(classMap2);*/
                
                
                
                ArrayList<Mapping> propertyMappingList = new ArrayList<Mapping>();
                ArrayList<String> sourcePatterns = null;
                ArrayList<String> targetPatterns = null;
                ArrayList<String> transformPatterns = null;
                //ArrayList<String> sourcePatterns = new ArrayList<String>();
                //ArrayList<String> targetPatterns = new ArrayList<String>();
                String sourcePattern = "?SUBJ tab:Date ?o";
                String targetPattern = "?SUBJ dbpedia:date ?o";
                String transformPattern = "";    
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
                transformPatterns = getPattern(transformPattern);
                /*Mapping propMap1 = new Mapping("map1",sourcePatterns, targetPatterns,null);
                propertyMappingList.add(propMap1);*/
                
                sourcePattern = "?SUBJ tab:hasValue ?o";
                targetPattern = "?SUBJ rdfs:label ?o";         
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
                /*Mapping propMap2 = new Mapping("map2",sourcePatterns, targetPatterns,null);
                propertyMappingList.add(propMap2);*/

                
                sourcePattern = "?SUBJ rdf:type tab:dataset";
                targetPattern = "?SUBJ rdf:type qb:dataset";
                transformPattern = "";
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
               /* Mapping propMap3 = new Mapping("map3",sourcePatterns, targetPatterns,null);
                propertyMappingList.add(propMap3);*/
                
                sourcePattern = "?SUBJ rdf:type tab:tabularRecord";
                targetPattern = "?SUBJ rdf:type qb:Observation";
                transformPattern = "";
                sourcePatterns = getPattern(sourcePattern);
                targetPatterns = getPattern(targetPattern);
               /* Mapping propMap4 = new Mapping("map4",sourcePatterns, targetPatterns,null);
                propertyMappingList.add(propMap4);*/
                
                
                schMapManager.createMappingTask(dataset.getName(), "testMappingTask");
                
                //JSONObject results =  schMapManager.executeMappingTask(propertyMappingList, "testMappingTask");
                //System.out.println(results.toString());
                schMapManager.confirmMappingTask("testMappingTask");
                
                
                
                
               /* LinkingTask task = new LinkingTask(dataset1,dataset2,userInput);
                
                task.setPrefixes(service.prefixesManager.getPrefixesMap());
                task.setLinkingFileLocation("C:/Users/John/Desktop/data"+
                                                          "/"+"linkingTest.xml");
                task.start();
                
                FunctionManager funman = new FunctionManager();
                
                funman.getFunctions();*/
        }
        
        
        public static ArrayList<String> getPattern(String pattern){
                ArrayList<String> array = new ArrayList<String>();
                array.add(pattern);
                return array;
        }
        

        private static JSONObject transformInput() throws JSONException {
  
                JSONObject transf1 = transformationObject(true,"replace");
                JSONObject transf2 = transformationObject(false,"lowerCase");
                
                //JSONObject transf3 = transformationObject(false,"stripUriPrefix");
                
                JSONObject path_o1 = inputObject("?a1/rdfs:label");
                transf1.put("input", new JSONArray().put(path_o1));
                transf2.put("input", new JSONArray().put(transf1));
                
                
   
                JSONObject transf3 = transformationObject(true,"replace");
                JSONObject transf4 = transformationObject(false,"lowerCase");
                JSONObject path_o2 = inputObject("?b1/rdfs:label");
                transf3.put("input", new JSONArray().put(path_o2));
                transf4.put("input", new JSONArray().put(transf3));
                
                JSONObject comp = compareObject("jaro");
                comp.put("input", new JSONArray().put(transf2).put(transf4));
                
                
                JSONObject aggr = aggregateObject("average");
                aggr.put("input", new JSONArray().put(comp));
                
               // transf3.put("input", new JSONArray().put(path_o1));
                
                //transf1.put("input", new JSONArray().put(transf3));

                
                
                return transf2;
        }

        private static JSONObject aggregateRule() throws JSONException {
                
                JSONObject rule = aggregateObject("max");
                
                JSONArray input = new JSONArray(); 
                
                JSONObject aggr1 = aggregateObject("min");
                
                JSONObject aggr3 = aggregateObject("average");
                
                
                aggr1.put("input",new JSONArray().put(aggr3));
                
                JSONObject aggr2 = new JSONObject();
                aggr2.put("nodeType", "Aggregate");
                aggr2.put("type", "average");
                
                JSONObject comp4 = compareObject("levenshteinDistance");
                
                comp4.put("input", new JSONArray().put(transformInput()));
                
                aggr1.put("input",new JSONArray().put(comp4));
                aggr2.put("input",new JSONArray().put(comp4));
                
                input.put(aggr1);
                input.put(aggr2);
                
                rule.put("input", input);
                return rule;
        }
}
