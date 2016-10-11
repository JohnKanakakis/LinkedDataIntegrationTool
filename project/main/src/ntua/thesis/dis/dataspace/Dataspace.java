package ntua.thesis.dis.dataspace;

import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import ntua.thesis.dis.util.SPARQLUtils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hp.hpl.jena.query.Dataset;
import com.hp.hpl.jena.query.DatasetFactory;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryCancelledException;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.util.FileManager;
import com.hp.hpl.jena.util.LocationMapper;


public class Dataspace {
        
        static final Logger logger = LoggerFactory.getLogger("Dataspace");
        private Dataset dataspace = null;
        private FileManager fm = FileManager.get();
        private List<JSONObject> datasetsInfo = new ArrayList<JSONObject>();
        private JSONObject metadata = new JSONObject();
        private boolean busy = false;
        private HashMap<Long,QueryExecution> queryExecutions = new HashMap<Long,QueryExecution>();
        private List<JSONObject> savedQueries = new ArrayList<JSONObject>();
        
        public void addDataset(JSONObject datasetInfo){
                
                if(!datasetsInfo.contains(datasetInfo)){
                        datasetsInfo.add(datasetInfo);
                }
        }
        
        public int build(){
                
                if(datasetsInfo.size() == 0) return -1;
                
                LocationMapper locMap = fm.getLocationMapper();
                List<String> list = new ArrayList<String>();
                
                String fileString = "";
                String graphName = "";
                for(JSONObject info : datasetsInfo){
                        try {
                                fileString = info.getString("file");
                                graphName = info.getString("graphName");
                                System.out.println("dataset file > "+fileString);
                                System.out.println("dataset graph > "+graphName);
                        } catch (JSONException e) {
                                
                                e.printStackTrace();
                                return -1;
                        }
                        
                        fm.loadModel(fileString);
                        locMap.addAltEntry(graphName, fileString);
                        list.add(graphName);
                }
                dataspace = DatasetFactory.createNamed(list, fm);
                
                
                return 1;
        }
        
        private void storeQueryExecution(long queryId,QueryExecution qexec){
                if(this.queryExecutions.containsKey(queryId)){
                       this.stopQueryExecution(queryId);
                }else{
                       this.queryExecutions.put(queryId,qexec);
                }
                
        }
        
        private void deleteQueryExecution(long queryId){
                this.queryExecutions.remove(queryId);
        }
        
        private QueryExecution getQueryExecution(long queryId){
                return this.queryExecutions.get(queryId);
        }
        
        public void stopQueryExecution(long queryId) {
                // TODO Auto-generated method stub
                QueryExecution qexec = this.getQueryExecution(queryId);
                if(qexec!=null){
                        try{
                                qexec.abort();
                                
                        }catch(QueryCancelledException | ConcurrentModificationException e){
                                qexec.close(); 
                                //this.deleteQueryExecution(queryId);
                        }finally{
                                
                                System.out.println(qexec.toString() + " is closed!");
                                this.deleteQueryExecution(queryId);
                        }
                }
        }
        
        public JSONArray executeQuery(String queryString,long queryId){
                /*if(this.busy){
                        return null;
                }*/
                Query query = QueryFactory.create(queryString);
                QueryExecution qexec = QueryExecutionFactory.create(query, this.dataspace);
                this.storeQueryExecution(queryId, qexec);
                JSONArray resultsJSON = new JSONArray();
                try {
                        ResultSet results = qexec.execSelect();
                        resultsJSON = SPARQLUtils.getSPARQLQueryResultsInJSON(results);
                }catch(QueryCancelledException | ConcurrentModificationException e){
                        qexec.close() ; 
                        this.deleteQueryExecution(queryId);
                }finally {
                        //qexec.close(); 
                        this.deleteQueryExecution(queryId);
                       
                }
                return resultsJSON;
                //this.busy = false;
        }

        public void empty() {
                this.datasetsInfo.clear();
                this.dataspace = null;
                this.deleteSavedQueries();
                this.queryExecutions.clear();
        }

        public JSONArray getNamedGraphs(){
                
                JSONArray graphs = new JSONArray();
                if(dataspace == null){
                        logger.info("Dataspace is empty!!!");
                        return graphs;
                }
                
                Iterator<String> it = dataspace.listNames();
                
                String namedGraph = "";
                while (it.hasNext()){
                        namedGraph = it.next();
                        JSONObject graph = new JSONObject();
                        Long size = dataspace.getNamedModel(namedGraph).size();
                        try {
                                graph.put("uri", namedGraph);
                                graph.put("size",size);
                                graphs.put(graph);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                                System.out.println(namedGraph);
                                System.out.println(size);
                                continue;
                        }
                        
                        System.out.println(namedGraph);
                        System.out.println(size);
                }
                return graphs;
        }

        public void setSavedQueries(JSONArray queries) {
                // TODO Auto-generated method stub
                this.deleteSavedQueries();
                for(int i = 0; i < queries.length();i++){
                        try {
                                this.savedQueries.add(queries.getJSONObject(i));
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
        }  
        
        public JSONArray getSavedQueries() {
                // TODO Auto-generated method stub
                
                JSONArray array = new JSONArray();
                for(JSONObject q : this.savedQueries){
                        array.put(q);
                }
                return array;
        }  
        
        public void deleteSavedQueries(){
                this.savedQueries.clear();
        }
}
