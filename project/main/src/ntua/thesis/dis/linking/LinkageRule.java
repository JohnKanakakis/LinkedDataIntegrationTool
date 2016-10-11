package ntua.thesis.dis.linking;

import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.DOMException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;


public class LinkageRule {

        private JSONObject rule_o;
        private Document document;
        private ArrayList<String> inputPaths = new ArrayList<String>();
        
       
        
        public LinkageRule(JSONObject o){
                rule_o = o;
        }
        
        private Element traverseTree(JSONObject parent) throws JSONException{
                
                System.out.println(parent.toString());
                String elType = parent.getString("elType");
                String name = parent.getString("elName");
                JSONArray params = parent.getJSONArray("params");
                JSONArray input = parent.getJSONArray("input");
                //JSONObject function_o = parent.getJSONObject("functionObject");
               
                Element parentNode = null;
                if(elType.equals("aggregation")){
                        parentNode = document.createElement("Aggregate");
                        parentNode.setAttribute("type", name); 
                        for(int i = 0; i < params.length();i++){
                                parentNode.setAttribute(params.getJSONObject(i).getString("name"),
                                                        params.getJSONObject(i).getString("value"));
                        }
                }else if(elType.equals("comparison")){
                        parentNode = document.createElement("Compare");
                        parentNode.setAttribute("metric", name); 
                        for(int i = 0; i < params.length();i++){
                                parentNode.setAttribute(params.getJSONObject(i).getString("name"),
                                                        params.getJSONObject(i).getString("value"));
                        }
                        /*String metric = parent.getString("metric");
                        Double threshold = parent.getDouble("threshold");
                        
                        parentNode.setAttribute("metric", metric);    
                        parentNode.setAttribute("threshold", Double.toString(threshold));  */  
                }else if(elType.equals("transformation")){
                        parentNode = document.createElement("TransformInput");
                        //String function = parent.getString("function");
                        parentNode.setAttribute("function", name);   
                        /*if(parent.has("params")){
                                JSONArray params = parent.getJSONArray("params");
                                for(int i = 0; i < params.length();i++){
                                        String name = params.getJSONObject(i).getString("name");
                                        String value = params.getJSONObject(i).getString("value");
                                        Element paramNode = document.createElement("Param");
                                        paramNode.setAttribute("name", name);
                                        paramNode.setAttribute("value", value);
                                        parentNode.appendChild(paramNode);
                                }   
                        }*/
                         
                }else if(elType.equals("input")){
                        parentNode = document.createElement("Input");
                        for(int i = 0; i < params.length();i++){
                                parentNode.setAttribute(params.getJSONObject(i).getString("name"),
                                                        params.getJSONObject(i).getString("value"));
                                inputPaths.add(params.getJSONObject(i).getString("value"));
                                
                        }
                }
                
                if(input.length()>0){
                        for(int i = 0; i < input.length();i++){
                                JSONObject child = input.getJSONObject(i);
                                Element childNode = traverseTree(child);
                                parentNode.appendChild(childNode);
                                if(elType.equals("transformation")){
                                        for(int j = 0; j < params.length();j++){
                                                Element paramNode = document.createElement("Param");
                                                paramNode.setAttribute("name",params.getJSONObject(j).getString("name"));
                                                paramNode.setAttribute("value",params.getJSONObject(j).getString("value"));
                                                parentNode.appendChild(paramNode);
                                        }   
                                }
                        }   
                }
                
                return parentNode;
        }

        public Element writeTo(Document document){
                this.document = document;
                
                Element linkCondition = this.document.createElement("LinkageRule");
                
                try {
                        linkCondition.appendChild(traverseTree(this.rule_o));
                } catch (DOMException | JSONException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                } 
                return linkCondition;
        }
        
        public ArrayList<String> getInputPaths(){
                return this.inputPaths;
        }
}
