package ntua.thesis.dis.linking;



import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


public class FunctionManager {

        private JSONArray transformationFunctions;
        private JSONArray comparisonFunctions;
        private JSONArray aggregationFunctions;
        
        
        public FunctionManager() throws JSONException{
                transformationFunctions = new JSONArray();
                comparisonFunctions = new JSONArray();
                aggregationFunctions = new JSONArray();
                setUpTransformationFunctions();
                setUpComparisonFunctions();
                setUpAggregationFunctions();
        }
        
        private void setUpTransformationFunctions() throws JSONException{
                
                JSONArray params;
                
                JSONObject removeBlanks = new JSONObject();
                removeBlanks.put("elName","removeBlanks");
                removeBlanks.put("params",new JSONArray());
                transformationFunctions.put(removeBlanks);
                
                JSONObject removeSpecialChars = new JSONObject();
                removeSpecialChars.put("elName","removeSpecialChars");
                removeSpecialChars.put("params",new JSONArray());
                transformationFunctions.put(removeSpecialChars);
                
                JSONObject lowerCase = new JSONObject();
                lowerCase.put("elName","lowerCase");
                lowerCase.put("params",new JSONArray());
                transformationFunctions.put(lowerCase);
                
                JSONObject upperCase = new JSONObject();
                upperCase.put("elName","upperCase");
                upperCase.put("params",new JSONArray());
                transformationFunctions.put(upperCase);
                
                JSONObject capitalize = new JSONObject();
                capitalize.put("elName","capitalize");
                capitalize.put("params",new JSONArray());
                transformationFunctions.put(capitalize);
                
                JSONObject stem = new JSONObject();
                stem.put("elName","stem");
                stem.put("params",new JSONArray());
                transformationFunctions.put(stem);
                
                JSONObject alphaReduce = new JSONObject();
                alphaReduce.put("elName","alphaReduce");
                alphaReduce.put("params",new JSONArray());
                transformationFunctions.put(alphaReduce);
                
                JSONObject numReduce = new JSONObject();
                numReduce.put("elName","numReduce");
                numReduce.put("params",new JSONArray());
                transformationFunctions.put(numReduce);
                
                JSONObject replace = new JSONObject();
                replace.put("elName","replace");
                params = new JSONArray();
                params.put(new JSONObject().put("name","search").put("value",""));
                params.put(new JSONObject().put("name","replace").put("value",""));
                replace.put("params", params);
                transformationFunctions.put(replace);
                
                JSONObject regexReplace = new JSONObject();
                regexReplace.put("elName","regexReplace");
                params = new JSONArray();
                params.put(new JSONObject().put("name","regex").put("value",""));
                params.put(new JSONObject().put("name","replace").put("value",""));
                regexReplace.put("params", params);
                transformationFunctions.put(regexReplace);
        }
        
        private void setUpComparisonFunctions() throws JSONException{
                
                JSONArray params = new JSONArray();
                params.put(new JSONObject().put("name","weight").put("value",""));
                params.put(new JSONObject().put("name","required").put("value",""));
                params.put(new JSONObject().put("name","threshold").put("value",""));
                
                JSONObject levenshteinDistance = new JSONObject();
                levenshteinDistance.put("elName","levenshteinDistance");
                levenshteinDistance.put("params", params);
                comparisonFunctions.put(levenshteinDistance);
                
                JSONObject equality = new JSONObject();
                equality.put("elName","equality");
                equality.put("params", params);
                comparisonFunctions.put(equality);
                
                JSONObject inequality = new JSONObject();
                inequality.put("elName","inequality");
                inequality.put("params", params);
                comparisonFunctions.put(inequality);
                
                JSONObject jaccard = new JSONObject();
                jaccard.put("elName","jaccard");
                jaccard.put("params", params);
                comparisonFunctions.put(jaccard);
                
                JSONObject wgs84 = new JSONObject();
                wgs84.put("elName","wgs84");
                JSONArray specificParams = new JSONArray();
                specificParams.put(new JSONObject().put("name","weight").put("value",""));
                specificParams.put(new JSONObject().put("name","required").put("value",true));
                specificParams.put(new JSONObject().put("name","threshold").put("value",""));
                specificParams.put(new JSONObject().put("name","unit").put("value",""));
                wgs84.put("params", specificParams);
                comparisonFunctions.put(wgs84);
                
                
        }
        
        private void setUpAggregationFunctions() throws JSONException{
                
                JSONArray params = new JSONArray();
                params.put(new JSONObject().put("name","required").put("value",""));
                params.put(new JSONObject().put("name","weight").put("value",""));
                
                JSONObject max = new JSONObject();
                max.put("elName","max");
                max.put("params", params);
                aggregationFunctions.put(max);
                
                JSONObject min = new JSONObject();
                min.put("elName","min");
                min.put("params", params);
                aggregationFunctions.put(min);
                
                JSONObject average = new JSONObject();
                average.put("elName","average");
                average.put("params", params);
                aggregationFunctions.put(average);
        }
       
        public JSONObject getFunctions() throws JSONException {
                JSONObject functions = new JSONObject();
                functions.put("transformation",transformationFunctions);
                functions.put("comparison",comparisonFunctions);
                functions.put("aggregation",aggregationFunctions);
                return functions;
        }

        
}
