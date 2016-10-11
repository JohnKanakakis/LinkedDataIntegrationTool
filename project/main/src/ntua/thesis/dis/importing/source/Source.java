package ntua.thesis.dis.importing.source;

import org.json.JSONArray;
import org.json.JSONObject;


public interface Source {

        public JSONArray fetchData(String query);
        
        public JSONArray fetchData();
        
        public JSONObject getMetadata();
}
