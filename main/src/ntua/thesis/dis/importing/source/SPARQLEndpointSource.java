package ntua.thesis.dis.importing.source;


import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.StandardOpenOption;


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
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.rdf.model.StmtIterator;



public class SPARQLEndpointSource {

        private String serviceURL;
        private Model queryResultsModel;
        
        
        public SPARQLEndpointSource(String endpointURL) {
                setURL(endpointURL);
        }

        public String getServiceURL() {
                return serviceURL;
        }

        public void setURL(String serviceURL) {
                this.serviceURL = serviceURL;
        }
        
        public Model getQueryResultsModel() {
                return queryResultsModel;
        }

        public void setQueryResultsModel(Model queryResultsModel) {
                this.queryResultsModel = queryResultsModel;
        }
        
        public long executeSPARQLQuery(String queryString,File file){
                
                try {
                        OutputStream out = Files.newOutputStream(file.toPath(), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                        Query query = QueryFactory.create(queryString);
                        
                        if(!query.isConstructType()){
                                return -2;
                        }
                        
                        QueryExecution qexec = QueryExecutionFactory.sparqlService(serviceURL, query);
                        //ResultSet result = qexec.execSelect();
                        queryResultsModel = qexec.execConstruct();
                        queryResultsModel.write(out,"TTL");
                        qexec.close();
                        
                        return queryResultsModel.size();
                        
                } catch (IOException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return -1;
                } 
        }

        public JSONArray getStatements(int numberOfStatements){
                StmtIterator it  = queryResultsModel.listStatements();
                
                Statement currentStatement;
                JSONArray triples = new JSONArray();
                int i = 1;
                while(it.hasNext() && i<=numberOfStatements){
                        currentStatement = it.next();
                        JSONObject triple = new JSONObject();
                        try {
                                triple.put("s", currentStatement.getSubject());
                                triple.put("p", currentStatement.getPredicate());
                                triple.put("o", currentStatement.getObject());
                                triples.put(triple);
                                i++;
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                        
                }
                return triples;
        }
}
