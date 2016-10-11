package ntua.thesis.dis.tests;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;

import org.json.JSONException;
import org.json.JSONObject;


import ntua.thesis.dis.dataspace.Dataset;
import ntua.thesis.dis.dataspace.DataspaceManager;
import ntua.thesis.dis.dataspace.DatasetVocabulary;
import ntua.thesis.dis.importers.VocabularyExtractor;
import ntua.thesis.dis.importing.SourcesManager;
import ntua.thesis.dis.importing.converter.TabularToRDFConverter;
import ntua.thesis.dis.linking.LinkingManager;
import ntua.thesis.dis.mapping.Mapping;
import ntua.thesis.dis.mapping.SchemaMappingManager;
import ntua.thesis.dis.mapping.SchemaMappingTask;
import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.service.ServiceManager;



public class MappingsTest {

        public ArrayList<String> getPattern(String pattern){
                ArrayList<String> array = new ArrayList<String>();
                array.add(pattern);
                return array;
        }
        
        public static void main(String[] args) throws IOException, JSONException {
            
                ServiceManager service = ServiceManager.getInstance();
                DataspaceManager dm = service.getDataspaceManager();
                SchemaMappingManager sm = service.schemaMappingManager;
                
                
                TabularToRDFConverter conv = new TabularToRDFConverter();
                
                
                
                String fileName = "data.xls";
                File importedDatasetFile = Paths.get("C:/Users/John/Desktop/data",fileName).toFile();
                boolean bool = Files.deleteIfExists(Paths.get("C:/Users/John/Desktop/data/output.ttl"));
                System.out.println(bool);
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
                
                VocabularyExtractor vocEx = new VocabularyExtractor();
                vocEx.readData(exportedFile);
                
                
                
                MappingsTest t = new MappingsTest();
                
                ArrayList<Mapping> propertyMappingList = new ArrayList<Mapping>();
                ArrayList<String> sourcePatterns = null;
                ArrayList<String> targetPatterns = null;
                ArrayList<String> transformPatterns = null;
                //ArrayList<String> sourcePatterns = new ArrayList<String>();
                //ArrayList<String> targetPatterns = new ArrayList<String>();
                String sourcePattern = "?SUBJ tab:Date ?o.?o tab:hasValue ?v";
                String targetPattern = "?SUBJ dbpedia:date ?o";
                String transformPattern = "";    
                sourcePatterns = t.getPattern(sourcePattern);
                targetPatterns = t.getPattern(targetPattern);
                targetPatterns.add("?o rdfs:label ?v");
                targetPatterns.add("?o rdfs:label_1 ?v");
                targetPatterns.add("?SUBJ dbpedia:date_1 ?o");
                transformPatterns = t.getPattern(transformPattern);
                //Mapping propMap1 = new Mapping("map1",sourcePatterns, targetPatterns,null);
               // propertyMappingList.add(propMap1);
                
                sourcePattern = "?SUBJ rdf:type tab:tabularRecord";
                targetPattern = "?SUBJ rdf:type qb:Observation";         
                sourcePatterns = t.getPattern(sourcePattern);
                targetPatterns = t.getPattern(targetPattern);
               // Mapping propMap2 = new Mapping("map2",sourcePatterns, targetPatterns,null);
               // propertyMappingList.add(propMap2);

                
                sourcePattern = "?SUBJ rdf:type tab:dataset";
                targetPattern = "?SUBJ rdf:type qb:dataset";
                transformPattern = "";
                sourcePatterns = t.getPattern(sourcePattern);
                targetPatterns = t.getPattern(targetPattern);
                targetPatterns.add("?SUBJ rdfs:label 'mitsos'");
              //  Mapping propMap3 = new Mapping("map3",sourcePatterns, targetPatterns,null);
               //.add(propMap3);
              // 
                sm.createMappingTask(dataset.getName(), "testMappingTask");
                
               // JSONObject results =  sm.executeMappingTask(propertyMappingList, "testMappingTask");
               // System.out.println(results.toString());
                sm.confirmMappingTask( "testMappingTask");
        }
}
