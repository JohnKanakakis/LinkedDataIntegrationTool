package ntua.thesis.dis.query;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.hp.hpl.jena.query.ResultSet;

import ntua.thesis.dis.dataspace.DataspaceManager;
import ntua.thesis.dis.service.PrefixesManager;
import ntua.thesis.dis.service.ServiceManager;
import ntua.thesis.dis.tests.TestIntegration;
import ntua.thesis.dis.util.SPARQLUtils;


public class QueryManager {

        public ServiceManager sm;
        private HashMap<Long,JSONObject> queries = new HashMap<Long,JSONObject>();
        
        public QueryManager(ServiceManager serviceManager) {
                sm = serviceManager;
        }

        private Long generateID(){
                return System.currentTimeMillis() + Math.round(Math.random() * 1000000000000L);
        }
        
        public ArrayList<String> getPrefixes(){
                
                Set<Entry<String,String>> prefixes = PrefixesManager.getPrefixToUriMap().entrySet();
                Iterator<Entry<String, String>> it = prefixes.iterator();
                ArrayList<String> prefixesList = new ArrayList<String>();
                Entry<String,String> entry;
                
                while(it.hasNext()){
                        entry = it.next();
                        prefixesList.add(SPARQLUtils.getPrefixForSPARQLQuery(entry.getKey(),entry.getValue()));
                }
                return prefixesList;
        }


        public JSONArray executeQuery(String queryString,long queryId) {
                
                JSONObject query_o = this.updateQueryBody(queryString,queryId);
                
                try {
                        System.out.println("execute query with id >"+query_o.getLong("id"));
                        JSONArray resultsInJSON = sm.getDataspaceManager().executeQueryToDataspace(query_o.getString("body"),queryId);
                        return resultsInJSON;
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        return null;
                }
                
        }


        private JSONObject updateQueryBody(String queryString,long queryId) {
                JSONObject query_o = this.getQuery(queryId);
                query_o.remove("body");
                try {
                        query_o.put("body", queryString);
                        this.storeQuery(queryId, query_o);
                        return query_o;
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        //e.printStackTrace();
                        return null;
                }
        }

        private void storeQuery(long queryId,JSONObject query) {
                // TODO Auto-generated method stub
                this.queries.put(queryId, query);
        }
        
        public JSONObject getQuery(Long queryId) {
                // TODO Auto-generated method stub
                return this.queries.get(queryId);
        }

        public JSONArray getDataspaceVocabulary() {
                // TODO Auto-generated method stub
                return sm.getDataspaceManager().getDataspaceVocabulary();
        }
        
        
        public JSONArray loadDataspaceQueries(){
                this.queries.clear();
                JSONArray queries_a = sm.getDataspaceManager().getDataspaceQueries();
                JSONObject query_o;
                for(int i = 0;i < queries_a.length();i++){
                        try {
                                query_o = queries_a.getJSONObject(i);
                                this.storeQuery(query_o.getLong("id"), query_o);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                return queries_a;
        }
        
        public int buildDataspace(){
                return sm.getDataspaceManager().buildCurrentDataspace();
        }


        public JSONArray getNamedGraphs() {
                // TODO Auto-generated method stub
                return sm.getDataspaceManager().getNamedGraphs();
        }


        public void stopQueryExecution(long queryId) {
                // TODO Auto-generated method stub
                sm.getDataspaceManager().stopQueryExecution(queryId);
        }

        public JSONObject createQuery(String queryName) {
                // TODO Auto-generated method stub
                JSONObject query = new JSONObject();
                ArrayList<String> prefixes = this.getPrefixes();
                StringBuilder prefixBody = new StringBuilder();
                for(String prefixString : prefixes){
                        prefixBody.append(prefixString);
                }
                try {
                        Long queryId = this.generateID();
                        query.put("id", queryId);
                        query.put("name", queryName);
                        query.put("body", prefixBody.toString());
                        String date = new Date().toString();
                        query.put("Created",date);
                        this.storeQuery(queryId,query);
                        return query;
                } catch (JSONException e) {
                        return null;
                }
        }

        public boolean renameQuery(long id, String oldName, String newName) {
                JSONObject query_o = this.getQuery(id);
                query_o.remove("name");
                try {
                        query_o.put("name", newName);
                        this.storeQuery(id, query_o);
                        return true;
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return false;
                } 
        }

        public boolean saveQueries(JSONArray queries) {
                // TODO Auto-generated method stub
                JSONObject query_o;
                for(int i = 0; i < queries.length();i++){
                        try {
                                query_o = queries.getJSONObject(i);
                                this.storeQuery(query_o.getLong("id"), query_o);
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                //e.printStackTrace();
                                return false;
                        }
                }
                //saving all current queries;
                System.out.println(this.queries);
                return sm.getDataspaceManager().saveQueries(this.queries);  
        }

        public void reset() {
                // TODO Auto-generated method stub
                this.queries.clear();
        }
}
