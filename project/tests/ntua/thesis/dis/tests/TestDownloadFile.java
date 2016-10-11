package ntua.thesis.dis.tests;

import java.io.IOException;
import java.util.Set;

import ntua.thesis.dis.mapping.ExternalVocabularyManager;
import ntua.thesis.dis.mapping.SchemaMappingManager;
import ntua.thesis.dis.service.ServiceManager;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class TestDownloadFile {

        /**
         * @param args
         * @return 
         * @throws IOException 
         * @throws JSONException 
         */
        public static void main(String[] args) throws JSONException{
                // TODO Auto-generated method stub
                ServiceManager service = ServiceManager.getInstance();
                
                SchemaMappingManager sm = service.schemaMappingManager;
                JSONArray vocabularies;
                JSONObject voc;
                vocabularies = sm.getExternalVocabularies();
                
                
                
                
                
                /*for(int i = 0; i < 3; i++){
                        if(i == 1){
                                voc = sm.addExternalVocabulary("SDMX-DIMENSION","sdmx-dimension", "","http://publishing-statistical-data.googlecode.com/svn/trunk/specs/src/main/vocab/sdmx-dimension.ttl");
                        }else{
                                voc = sm.addExternalVocabulary("brain","brain", "","http://vocab.deri.ie/br.ttl");
                        }
                }
                vocabularies = sm.getExternalVocabularies();
                System.out.println(vocabularies.toString());*/
                //System.out.println(voc.toString());
                
                
      }
}
