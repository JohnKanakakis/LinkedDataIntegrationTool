package ntua.thesis.dis.tests;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.rdf.model.Model;


public class SPARQLServiceTest {

        /**
         * @param args
         */
        public static void main(String[] args) {
                // TODO Auto-generated method stub
                String serviceURL = "http://worldbank.270a.info/sparql";
                String queryString = "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>" +
                		             "CONSTRUCT {?x skos:prefLabel ?label} " +
                		             "where {<http://worldbank.270a.info/classification/country> skos:hasTopConcept ?x." +
                		             "?x  skos:prefLabel ?label}";
                                
                Query query = QueryFactory.create(queryString);
                
              
                
                QueryExecution qexec = QueryExecutionFactory.sparqlService(serviceURL, query);
                //ResultSet result = qexec.execSelect();
                Model queryResultsModel = qexec.execConstruct();
                System.out.println(queryResultsModel.size());
        }

}
