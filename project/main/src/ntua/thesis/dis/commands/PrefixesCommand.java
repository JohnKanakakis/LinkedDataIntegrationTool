package ntua.thesis.dis.commands;

import java.io.IOException;
import java.util.Iterator;
import java.util.Map.Entry;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import ntua.thesis.dis.mapping.SchemaMappingManager;
import ntua.thesis.dis.service.PrefixesManager;


public class PrefixesCommand extends Command{

        /**
         * 
         */
        private static final long serialVersionUID = 1L;

       /* private PrefixesManager pm;
        
        
        public PrefixesCommand(PrefixesManager prefixesManager) {
                pm = prefixesManager;
        }*/

        public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                
                String prefixesArray = request.getParameter("prefixes");
                String prefix;
                String namespaceUri;
                JSONObject error_response_o = new JSONObject();
                JSONObject success_response_o = new JSONObject();
               
                JSONArray prefixes = new JSONArray();
                try {
                        prefixes = new JSONArray(prefixesArray);
                        error_response_o.put("message","Prefixes were not imported!");
                        success_response_o.put("message","Prefixes were successfully imported!");
                } catch (JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                }
                JSONObject prefix_o;
                for(int i = 0; i < prefixes.length();i++){
                        try {
                                prefix_o = prefixes.getJSONObject(i);
                                prefix = prefix_o.getString("prefix");
                                namespaceUri = prefix_o.getString("namespaceUri");
                                PrefixesManager.addPrefix(prefix, namespaceUri);
                        } catch (JSONException e) {
                                e.printStackTrace();
                                respondJSON(response,error_response_o);
                        }
                }     
                respondJSON(response,success_response_o);
                
        }
        
       

        public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
                
                Iterator<Entry<String, String>> it = PrefixesManager.getPrefixToUriMap().entrySet().iterator();
                JSONArray prefixesJSON = new JSONArray();
                Entry<String,String> entry;
                
                while(it.hasNext()){
                        entry = it.next();
                        try {
                                prefixesJSON.put(new JSONObject().put("prefix",entry.getKey())
                                                                 .put("uri",entry.getValue()));
                        } catch (JSONException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                        }
                }
                respondJSON(response,prefixesJSON);
                /*doPost(request,response);*/
        }
}
