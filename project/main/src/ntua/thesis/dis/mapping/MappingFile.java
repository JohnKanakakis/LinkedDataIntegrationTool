package ntua.thesis.dis.mapping;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;
import java.util.Map.Entry;


public class MappingFile {

        private Path filePath;
        private OutputStream output;
        private int mappingsCount = 1;
        private String prefixesCollectionMappingName = "mp:prefixCollectionMapping";
        private HashMap<String,String> prefixesMap = new HashMap<String,String>();
        
        public MappingFile(String fileLocation) throws IOException{
                
                filePath = Paths.get(fileLocation);
                Files.deleteIfExists(filePath);
                output = Files.newOutputStream(filePath, StandardOpenOption.CREATE);
                output.write(("@prefix r2r: <http://www4.wiwiss.fu-berlin.de/bizer/r2r/>.\n"+
                              "@prefix mp: <http://localhost:8080/R2Rmappings/RDB2RDFmapping/>.\n").getBytes());
                
               // prefixesMap = map;
        }

        public void save() throws IOException {
                
                output.close();
        }
       /* 
        public void writeClassMappings(ArrayList<ClassMapping> classMappingList) throws IOException {
                
                HashMap<String,String> prefixDefinitions = null;
                
                for(int i = 0; i < classMappingList.size(); i++){
                      
                      output.write(("mp:mapping"+ mappingsCount +" a r2r:Mapping;\n").getBytes());   
                      output.write(("r2r:prefixDefinitions "+ "\"").getBytes());
                      prefixDefinitions = classMappingList.get(i).getPrefixesWithNsUri();
                      
                      Set<Entry<String, String>> set = prefixDefinitions.entrySet();
                      Iterator<Entry<String, String>> it = set.iterator();
                      
                      writePrefixes(it);
                      
                      output.write(("r2r:sourcePattern "+"\""+
                            classMappingList.get(i).getSourcePattern()+
                            "\""+";\n").getBytes());
                      output.write(("r2r:targetPattern "+"\""+
                            classMappingList.get(i).getTargetPattern()+
                            "\""+";\n").getBytes());
                      output.write(".\n".getBytes());
                         
                      mappingsCount++;
                }
                
        }*/

        public void writeMappings(ArrayList<Mapping> propertyMappingList) throws IOException {
                
                HashMap<String,String> prefixDefinitionsForAllMappings = new HashMap<String,String>();
                
                ArrayList<String> sourcePatterns = null;
                ArrayList<String> targetPatterns = null;
                ArrayList<String> transformations = null;
                for(int i = 0; i < propertyMappingList.size(); i++){

                    output.write(("mp:"+ propertyMappingList.get(i).getName() +" a r2r:Mapping;\n").getBytes()); 
                    
                    prefixDefinitionsForAllMappings.putAll(propertyMappingList.get(i).getPrefixesWithNsUri());
                    
                    output.write(("r2r:partOfMappingCollection" + " " + this.prefixesCollectionMappingName).getBytes()); 
                    output.write((";\n").getBytes());
                    /*output.write(("r2r:prefixDefinitions "+ "\"").getBytes());
                    prefixDefinitions = propertyMappingList.get(i).getPrefixesWithNsUri();
                    
                    Set<Entry<String, String>> set = prefixDefinitions.entrySet();
                    Iterator<Entry<String, String>> it = set.iterator();
                    
                    writePrefixes(it);*/
                    
                    
                    sourcePatterns = propertyMappingList.get(i).getSourcePatterns();
                    for(int j = 0; j < sourcePatterns.size(); j++){          
                            output.write(("r2r:sourcePattern "+"\"").getBytes());
                            output.write((sourcePatterns.get(j)+"").getBytes());   
                            output.write(("\""+";\n").getBytes());
                    }

                    targetPatterns = propertyMappingList.get(i).getTargetPatterns();
                    for(int j = 0; j < targetPatterns.size(); j++){    
                            output.write(("r2r:targetPattern "+"\"").getBytes());
                            output.write((targetPatterns.get(j)+"").getBytes());  
                            output.write(("\""+";\n").getBytes());
                    }

                    transformations = propertyMappingList.get(i).getTransformations();
                    
                    if (transformations!=null){
                            for(int j = 0; j < transformations.size(); j++){
                                    if(transformations.get(j)!=null){
                                            output.write(("r2r:transformation "+"\"").getBytes());
                                            output.write((transformations.get(j)).getBytes());   
                                            output.write(("\""+";\n").getBytes());   
                                    }
                                    
                            }
                           
                    }

                    output.write(".\n".getBytes());
                    this.mappingsCount++;
                }
                
                output.write((this.prefixesCollectionMappingName +" a r2r:Mapping;\n").getBytes());
                output.write(("r2r:prefixDefinitions "+ "\"").getBytes());
                Set<Entry<String, String>> set = prefixDefinitionsForAllMappings.entrySet();
                Iterator<Entry<String, String>> it = set.iterator();
                
                writePrefixes(it);
                output.write(".\n".getBytes());
        }

 
        private void writePrefixes(Iterator<Entry<String, String>> it) throws IOException{
                
                while(it.hasNext()){
                        Entry<String, String> prefix = it.next();
                        output.write(prefix.getKey().getBytes());
                        output.write(':');
                        output.write('<');
                        output.write(prefix.getValue().getBytes());
                        output.write(">.".getBytes());
                }      
                output.write(("\""+ ";\n").getBytes()); 
        }
}
