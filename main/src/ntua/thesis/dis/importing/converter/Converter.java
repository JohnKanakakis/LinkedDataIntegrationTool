package ntua.thesis.dis.importing.converter;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;

import org.apache.commons.codec.EncoderException;
import org.json.JSONException;
import org.json.JSONObject;

public interface Converter {

        public String[] getRDFProperties();
        
        public String[] getRDFClasses();
        
        public void setBaseURI(String baseUri);
        
        public void setDatasetName(String name);
        
        public void setOutputFile(File file);
        
        public void setInputFile(File file);
        
        public void setCustomizedVocabularyPrefix(String prefix);
        
        public void setDatasetPrefixes(HashMap<String, String> prefixes);
        
        public void setRecordClass(String recordClass);
        
        public void setDatasetClass(String datasetClass);

        public void convert() throws IOException, JSONException, EncoderException;

}
