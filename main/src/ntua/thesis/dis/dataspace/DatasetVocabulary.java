package ntua.thesis.dis.dataspace;


import java.util.HashMap;
import org.json.JSONArray;
import org.json.JSONException;


public class DatasetVocabulary {

        private String[] classes = null;
        private String[] properties = null;
        private HashMap<String,String> prefixes = new HashMap<String,String>();
     

        public HashMap<String,String> getPrefixes() {
                
                return prefixes;
        }

        public void setPrefixes(HashMap<String,String> prefixes) {
                this.prefixes = prefixes;
        } 
        
        public void setClasses(String[] rdfClasses){
                                    
                classes = rdfClasses;
        
        }
        
        public void setProperties(String[] rdfProperties){
                properties = rdfProperties;
        }

       /* public void addClasses(JSONArray rdfClasses) {
               
               String classString = null; 
               classes = new String[rdfClasses.length()];
               for(int i = 0;i < rdfClasses.length();i++){
                    try {
                            classString = rdfClasses.getJSONObject(i).getString("class");
                            classes[i] = classString;
                    } catch (JSONException e) {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                    }
               }
        }*/

       /* public void addProperties(JSONArray rdfProperties) {
           
                String propertyString = null; 
                properties = new String[rdfProperties.length()];
                for(int i = 0;i < rdfProperties.length();i++){
                     try {
                             propertyString = rdfProperties.getJSONObject(i).getString("property");
                             properties[i] = propertyString;
                     } catch (JSONException e) {
                             // TODO Auto-generated catch block
                             e.printStackTrace();
                     }
                } 
                
        }*/
        
        public void print(){
                
                System.out.println("classes: ");
                printArray(classes);
                
                System.out.println("properties: ");
                printArray(properties);
        }

        private void printArray(String[] array) {
                
               for(int i = 0; i < array.length;i++){
                   System.out.println(array[i]);
               }
        }

        public String[] getClasses() {
                return classes;
        }
        
        public String[] getProperties() {
                
                return properties;
        }

        
}
