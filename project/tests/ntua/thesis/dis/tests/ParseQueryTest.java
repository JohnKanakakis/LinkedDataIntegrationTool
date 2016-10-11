package ntua.thesis.dis.tests;

import java.io.IOException;
import java.util.Iterator;
import java.util.List;




import com.hp.hpl.jena.graph.Node;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.Syntax;
import com.hp.hpl.jena.sparql.core.TriplePath;
import com.hp.hpl.jena.sparql.syntax.Element;
import com.hp.hpl.jena.sparql.syntax.ElementGroup;
import com.hp.hpl.jena.sparql.syntax.ElementPathBlock;


public class ParseQueryTest {

        public static void main(String[] args) throws IOException {
                
              //  Query query = QueryFactory.create();
                //System.out.println(query.getBaseURI().toString());
                String queryString = "prefix foaf:<http://mitsos.com#> select * where{?SUBJ foaf:type foaf:Person ; foaf:spouse ?o ; foaf:birthDate ?b . FILTER(?b < '1980-01-01T00:00:00Z'^^foaf:dateTime)}";
                Query query = QueryFactory.create(queryString,"",Syntax.syntaxARQ);
                
               // System.out.println(query.getQueryPattern().toString());
                //String queryPattern = query.getQueryPattern().toString();
                
                //List<Element> elements = ((ElementGroup) query.getQueryPattern()).getElements();
                
                Element element = query.getQueryPattern();
                List<Element> list = ((ElementGroup) element).getElements();
                System.out.println(element.toString());
                int i = 0;
                for(Element elem:list){
                        System.out.println(i);
                        if(elem instanceof ElementPathBlock){
                                System.out.println(elem.toString());
                                System.out.println(elem.getClass());
                                System.out.println("important part of query");
                                ElementPathBlock pathBlock = (ElementPathBlock) elem;
                                Iterator<TriplePath> it = pathBlock.patternElts();
                                while(it.hasNext()){
                                        TriplePath triple = it.next();
                                        System.out.println("triple of path :" + triple.toString());
                                        System.out.println("predicate = " + triple.getPredicate());
                                        Node predicate = triple.getPredicate();
                                        Node object = triple.getObject();
                                        
                                        System.out.println("predicate namesapce: "+predicate.getNameSpace());
                                        System.out.println("predicate name: "+predicate.getLocalName());
                                        //System.out.println("predicate prefix: "+predicate.);
                                        if(object.isURI()){
                                                System.out.println("object namesapce: "+object.getNameSpace());
                                        }
                                        
                                        System.out.println("object "+object.toString() +" is variable :"+object.isVariable());
                                }
                        }
                        i++;
                }
                //queryPattern.split(regex)
                
        }
        
        
        
}
