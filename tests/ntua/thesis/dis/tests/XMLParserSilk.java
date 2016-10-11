package ntua.thesis.dis.tests;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import ntua.thesis.dis.importers.VocabularyExtractor;


public class XMLParserSilk {

        /**
         * @param args
         * @throws IOException 
         * @throws ParserConfigurationException 
         * @throws SAXException 
         */
        public static void main(String[] args) throws IOException, ParserConfigurationException, SAXException {
                // TODO Auto-generated method stub

                
                File file = Paths.get("C:/Users/John/Desktop/data", "accepted_links.xml").toFile();
                
                DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
                DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
                Document doc = dBuilder.parse(file);
                doc.getDocumentElement().normalize();
                NodeList nList = doc.getElementsByTagName("map");
                for(int i = 0; i < nList.getLength(); i++){
                        Node mapNode = nList.item(i);
                        if (mapNode.getNodeType() == Node.ELEMENT_NODE) {
                                System.out.println("\nCurrent Element :" + mapNode.getNodeName());
                                NodeList children = mapNode.getChildNodes();
                                for(int j = 0; j < children.getLength();j++){
                                        if(children.item(j).getNodeType() != Node.TEXT_NODE){
                                                Element cellElement = (Element)children.item(j);
                                                Element sourceEntity = (Element) ((Element) cellElement).getElementsByTagName("entity1").item(0);
                                                Element targetEntity = (Element) ((Element) cellElement).getElementsByTagName("entity2").item(0);
                                                Element confidence = (Element) ((Element) cellElement).getElementsByTagName("measure").item(0);
                                                System.out.println("source : " + sourceEntity.getAttribute("rdf:resource"));
                                                System.out.println("target: " + targetEntity.getAttribute("rdf:resource"));
                                                System.out.println("confidence : " + getConfidenceNumber(confidence.getTextContent()));
                                        }
                                }
                        }
                }
        }

        private static String getConfidenceNumber(String text) {
                
                int firstParPos = text.indexOf('(');
                int lastParPos = text.indexOf(')');
                return text.substring(firstParPos+1,lastParPos);
        }

}
