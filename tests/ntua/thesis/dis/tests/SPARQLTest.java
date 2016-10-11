package ntua.thesis.dis.tests;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;



import ntua.thesis.dis.service.PrefixesManager;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Literal;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.Resource;





public class SPARQLTest {

        public static void main(String[] args) throws IOException, JSONException  {
                
                Path filePath = Paths.get("C:/Users/John/Desktop/data/file1.nt");
                //PrefixesManager pm = new PrefixesManager();
                /*SPARQLPathAnalyzer anal = new SPARQLPathAnalyzer(filePath.toFile(),pm.getPrefixToUriMap());
                
                
                //anal.getVariablesFromPath("?a rdf:type qb:Observation.?a8 rdf:type ?m4.?a rdf:type qb:Observation..?a3 rdf:type qb:Observation");
                
                
                try{
                        JSONArray propertiesPerVariableArray = anal.getPathPropertiesOfVariable("?a rdf:type ?a1.?a dbpedia:Name ?name1.","?a");
                        System.out.println(propertiesPerVariableArray.toString());
                        for(int i = 0;i < propertiesPerVariableArray.length();i++){
                                JSONArray pathVariableProperties = propertiesPerVariableArray.getJSONObject(i).getJSONArray("properties");
                                for(int j = 0; j < pathVariableProperties.length();j++){
                                        JSONObject propertyInfo = pm.getVocabularyTermUriInJSONFormat(pathVariableProperties.getString(j));
                                        pathVariableProperties.put(j,propertyInfo);
                                }
                        }
                        System.out.println(propertiesPerVariableArray.toString());
                }catch (com.hp.hpl.jena.query.QueryParseException e){
                        e.printStackTrace();
                        System.out.println("Query parse error!");
                }   */             
        }
        
}
