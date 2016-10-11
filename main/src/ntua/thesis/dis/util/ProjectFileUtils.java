package ntua.thesis.dis.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.StandardOpenOption;

import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonPrimitive;


public class ProjectFileUtils extends FileUtils{

        private static String[] rdfFileExtensions = {"rdf","xml","ttl","n3","nt","nq"};
        
        
        
        public static String getFileExtension(String filename) {
                
                String extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length());
                return extension;
        }

        public static String getFileExtension(File file) {
                
                String fileToString = file.toString();
                return getFileExtension(fileToString);
        }
        
        public static boolean isRDFExtension(String extension){
                
                for(int i = 0; i < rdfFileExtensions.length;i++){
                        if(rdfFileExtensions[i].equals(extension)){
                                return true;
                        }
                }
                return false;
        }
        
        public static String getFilename(String filePath){
                int filenamePos = filePath.lastIndexOf('\\') + 1;
                String name = filePath.substring(filenamePos,filePath.length());
                return name;
        }
        
        public static String getFilename(File file){
                String fileToString = file.toString();
                return getFilename(fileToString);
        }

        public static String getFileNameWithNoExtension(String file){
                String filename = getFilename(file);
                int lastDotPos = filename.lastIndexOf('.');
                return filename.substring(0, lastDotPos);    
        }
        
        public static long getProjectID(String projectName) {
               
                
                return 0;
        }

        public static JSONObject readProjectMetadata(File metadataJSONFile) throws JSONException {
                // TODO Auto-generated method stub
                
                String line = "";
                Charset charset = Charset.forName("UTF-8");
                try (BufferedReader reader = Files.newBufferedReader(metadataJSONFile.toPath(), charset)) {
                    String l = "";
                    while ((l = reader.readLine()) != null) {
                            line+=l;
                            System.out.println(line);
                    }
                } catch (IOException x) {
                    System.err.format("IOException: %s%n", x);
                }
                
                JSONObject metadata = new JSONObject(line);
                
                
                return metadata;
        }

        public static boolean writeJSONMetadata(JSONObject object, File jsonFile) {
                // TODO Auto-generated method stub
                if(jsonFile.exists()){
                        jsonFile.delete();
                }
               /* JsonParser parser = new JsonParser();
                Gson gson = new GsonBuilder().setPrettyPrinting().create();

                JsonElement el = parser.parse(object.toString());
                String jsonString = gson.toJson(el);*/
                String jsonString = object.toString();
                try {
                        OutputStream out = Files.newOutputStream(jsonFile.toPath(), StandardOpenOption.CREATE);
                        out.write(jsonString.getBytes());
                        out.close();
                        return true;
                } catch (IOException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return false;
                }
                
        }

        public static boolean writeJSONMetadata(JSONArray array, File jsonFile) {
                
                if(jsonFile.exists()){
                        jsonFile.delete();
                }
               /* JsonParser parser = new JsonParser();
                Gson gson = new GsonBuilder().setPrettyPrinting().create();

                JsonElement el = parser.parse(array.toString());
                String jsonString = gson.toJson(el);*/
                String jsonString = array.toString();
                try {
                        OutputStream out = Files.newOutputStream(jsonFile.toPath(), StandardOpenOption.CREATE);
                        out.write(jsonString.getBytes());
                        out.close();
                        return true;
                } catch (IOException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return false;
                }
                
        }
        
        

}
