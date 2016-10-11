package ntua.thesis.dis.tests;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;

import org.json.JSONException;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.QuerySolution;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.RDFNode;

import ntua.thesis.dis.importers.VocabularyExtractor;
import ntua.thesis.dis.mapping.SchemaMappingManager;
import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.service.ServiceManager;


public class TestTTLJena {

        public static void main(String[] args) throws IOException, JSONException {
                
                File file = Paths.get("C:/Users/John/Desktop/data","datasetSpec.nt").toFile();
                
                VocabularyExtractor vox = new VocabularyExtractor();
                vox.readData(file);
                Model model = vox.getModel();
                System.out.println(vox.getRDFClasses().toString());
                System.out.println(vox.getRDFProperties().toString());
                ServiceManager service = ServiceManager.getInstance();
                SchemaMappingManager sm = service.schemaMappingManager;
                PrefixesManager.addPrefix("tab", "http://localhost:8080/tab/data/TabularDef#");
                //System.out.println(sm.analyzePatternAndQuery("?s tab:Date ?o.?o tab:hasValue ?v", 20).toString());
                /*String prefixes = "PREFIX "+ "rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"+
                                  "PREFIX "+ "tab:<http://localhost:8080/tab/data/TabularDef#>\n"+
                                  "PREFIX " + "rdfs:<http://www.w3.org/2000/01/rdf-schema#>\n";
                
                String queryString = "SELECT ?s ?o ?v where {?s tab:Date ?o.?o tab:hasValue ?v} LIMIT 20";
                queryString = prefixes + queryString;
                Query query = QueryFactory.create(queryString.toString()) ;
                QueryExecution qexec = QueryExecutionFactory.create(query, model) ;
                try {
                  ResultSet results = qexec.execSelect() ;
                  for ( ; results.hasNext() ; )
                  {
                          QuerySolution soln = results.nextSolution();
                          System.out.println(soln.toString()) ;
                          RDFNode x = soln.get("?w") ;
                          //System.out.println(x.toString()) ;
                    RDFNode x = soln.get("varName") ;       // Get a result variable by name.
                    Resource r = soln.getResource("VarR") ; // Get a result variable - must be a resource
                    Literal l = soln.getLiteral("VarL") ;   // Get a result variable - must be a literal
                  }
                } finally { qexec.close() ; }*/
        }
       
        
        
}
