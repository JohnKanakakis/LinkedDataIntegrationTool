package ntua.thesis.dis.util;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;

import org.apache.jena.riot.Lang;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.graph.Triple;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.QueryParseException;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.query.Syntax;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.sparql.core.TriplePath;
import com.hp.hpl.jena.sparql.syntax.Element;
import com.hp.hpl.jena.sparql.syntax.ElementGroup;
import com.hp.hpl.jena.sparql.syntax.ElementPathBlock;
import com.hp.hpl.jena.sparql.syntax.ElementTriplesBlock;


public class SPARQLUtils {



        public static JSONArray getVariablesOfPattern(String pattern,HashMap<String, String> prefixToUriMap){
                
                JSONArray variablesJSON = new JSONArray();
                
                String prefixString = getPrefixesForSPARQLQuery(prefixToUriMap);
                String queryString = prefixString + "SELECT * WHERE {" + pattern + "}";
                Query query = QueryFactory.create(queryString);
                List<String> variables = query.getResultVars();
                for(int i = 0; i < variables.size();i++){
                        variablesJSON.put(variables.get(i));
                }
                return variablesJSON;  
        }
        
       

       /* public static String getSubjectOfTriple(Triple triple) {
                
                return triple.getSubject().toString();
        }

        public static String getObjectOfClause(String clause) {
                
                
                return clause.split(" ")[2];
        }

        public static String getPredicateOfClause(String clause) {
               
                return clause.split(" ")[1];
        }*/

       /* public static String[] splitUriToTokens(String term) {
                
                int pos = 0; 
                
                if(term.indexOf('#') == -1){
                        pos = term.lastIndexOf('/');
                }
                else{
                        pos = term.lastIndexOf('#');  
                }
                
                String result[] = new String[2];
                result[0] = term.substring(0, pos+1);
                
                result[1] = term.substring(pos+1,term.length());
                return result;
        }

        public static String[] splitTerm(String term) {
                return term.split(":");
        }*/

        public static String getPrefixForSPARQLQuery(String prefix, String nsUri) {
                return ("PREFIX" + " " + prefix + ":" + "<" + nsUri + ">\n");//"PREFIX qb: <http://purl.org/linked-data/cube#>"
        }

        
        public static JSONArray getSPARQLQueryResultsInJSON(ResultSet results){
                
                JSONArray resultsJSON = new JSONArray();
                Iterator<String> it;
                String varName = "";
                
                for ( ; results.hasNext() ; )
                {
                        QuerySolution soln = results.nextSolution();
                        JSONObject record = new JSONObject();
                        it = soln.varNames();
                        while(it.hasNext()){
                                varName = it.next();
                                try {
                                        record.put(varName, soln.get(varName));
                                } catch (JSONException e) {    
                                        e.printStackTrace();
                                }
                        }
                        resultsJSON.put(record);
                }
                return resultsJSON;
        }

        public static Model readRdfFile(File file) {
                
                String fileToString = file.toString();
                String extension = fileToString.substring(fileToString.lastIndexOf('.') + 1, fileToString.length());
                String lang = "RDF/XML";
                if(extension.equals("ttl")){
                        lang = "TTL";
                }else if(extension.equals("rdf") || extension.equals("xml")){
                        lang = "RDF/XML";
                }else if(extension.equals("nt")){
                        lang = "N3";
                }else if(extension.equals("nq")){
                        lang = "N-TRIPLE";
                }
                Path filePath = file.toPath();
                Model model = ModelFactory.createDefaultModel();
                InputStream input;
                try {
                        input = Files.newInputStream(filePath,StandardOpenOption.READ);
                        model.read(input,null,lang);
                        input.close();
                } catch (IOException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return null;
                }
                
                return model;
        }
        
        public static int writeModelToFile(Model model,File file,String lang){
                
                try {
                        OutputStream out = Files.newOutputStream(file.toPath(), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                        model.write(out,lang);
                } catch (IOException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return -1;
                }
                return 1;
        }

        public static String getPrefixesForSPARQLQuery(HashMap<String, String> prefixesMap) throws QueryParseException{
                
                StringBuilder builder = new StringBuilder();
                Iterator<Entry<String, String>> it = prefixesMap.entrySet().iterator();
                Entry<String, String> prefixEntry;
                while(it.hasNext()){
                        prefixEntry = it.next();
                        builder.append(getPrefixForSPARQLQuery(prefixEntry.getKey(),prefixEntry.getValue()));
                }
                
                return builder.toString();
        }

        public static void parseQuery(String queryString) {
                Query query = QueryFactory.create(queryString);
                //query = QueryFactory.parse(query,queryString,"",Syntax.syntaxARQ); 
        }

        public static Model readRdfFile(String file) {
                return SPARQLUtils.readRdfFile(Paths.get(file).toFile()); 
        }

        public static JSONObject getTermInJSON(String prefix,String nsUri,String name) {
                
               /* Property property = ModelFactory.createDefaultModel().createProperty(termUri);
                String name = property.getLocalName();
                String namespace = property.getNameSpace();
                String prefix = uriToPrefixMap.get(namespace);*/
                JSONObject o = new JSONObject();
                
                try {
                        o.put("prefix",prefix);
                        o.put("uri",nsUri);
                        o.put("name",name);
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                
                return o;
        }

        public static List<Triple> getTriplesOfPattern(String pattern,HashMap<String,String> prefixToUriMap) {
                String prefixesString = getPrefixesForSPARQLQuery(prefixToUriMap);
                
                String queryString = "";
                String selectString = "select * where{" + pattern + "}";
                queryString+=(prefixesString + selectString);
                List<Triple> list = getTriplesOfQuery(queryString);
                return list;
        }
        
        
        public static List<Triple> getTriplesOfQuery(String queryString) {
                //Query query = QueryFactory.parse(query,queryString,"",Syntax.syntaxARQ);
                
                Query query = QueryFactory.create(queryString);
                Element element = query.getQueryPattern();
                List<Element> list = ((ElementGroup) element).getElements();
                Iterator<TriplePath> tp_it;
                Iterator<Triple> t_it;
                ElementPathBlock pathBlock;
                ElementTriplesBlock triplesBlock;
                TriplePath triplePath;
                Triple triple;
                List<Triple> triples = new ArrayList<Triple>();
               
                System.out.println("ELEMENT LIST SIZE > " + list.size());
                for(Element elem:list){
                        System.out.println("ELEMENT CLASS > "+elem.getClass());
                         if(elem instanceof ElementPathBlock) {
                                 /*System.out.println(elem.toString());
                                 
                                 System.out.println("important part of query");*/
                                 System.out.println("ELEMENT > "+elem.toString());
                                 pathBlock = (ElementPathBlock) elem;
                                 tp_it = pathBlock.patternElts();
                                 while(tp_it.hasNext()){
                                         triplePath = tp_it.next();
                                         triples.add(triplePath.asTriple());
                                         /*System.out.println("triple of path :" + triple.toString());
                                         System.out.println("predicate = " + triple.getPredicate());*/
                                 }
                         }else if(elem instanceof ElementTriplesBlock){
                                 triplesBlock = (ElementTriplesBlock) elem;
                                 t_it = triplesBlock.patternElts();
                                 while(t_it.hasNext()){
                                         triple = t_it.next();
                                        
                                         triples.add(triple);
                                         /*System.out.println("triple of path :" + triple.toString());
                                         System.out.println("predicate = " + triple.getPredicate());*/
                                 }
                         }

                }
                return triples;
        }



        public static String getPropertyName(String propertyString) {
                // TODO Auto-generated method stub
                
                Model model = ModelFactory.createDefaultModel();
                Property property = model.createProperty(propertyString);
                return property.getLocalName();
        }
}
