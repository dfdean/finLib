////////////////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2014-2024 Dawson Dean
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
////////////////////////////////////////////////////////////////////////////////
//
// LogEvent
//
// Util_ReadURLIntoXML
// Util_ParseStringIntoXML
//
// Util_GetChildNode
// Util_GetNumChildNodes(parentNode, childName)
// Util_GetNthChildNode
// Util_GetPeerNode
// Util_GetNamedPrevPeer
//
// Util_GetOrCreateChildNode
// Util_RemoveNamedChildNodes
// Util_RemoveAllChildNodes
// Util_NodeHasChildNodes(parentNode)
//
// Util_SetTextContents
// Util_GetTextContents
// Util_SetChildNodeText
// Util_GetChildNodeText
//
// Util_SetTextEditElement
// Util_GetTextEditValue
//
// Util_GetInputNumber
// Util_SetInputStr(elementName, valueStr)
// Util_RoundNumber
//
// Util_InitToggleState
// Util_GetToggleState
// Util_SwitchToggleState
//
// Util_AddOptionToComboBox
//
// Util_GetDescendantNodeByID
//
////////////////////////////////////////////////////////////////////////////////

var DD_DEBUG = true;


////////////////////////////////////////////////////////////////////////////////
//
// [LogEvent]
//
////////////////////////////////////////////////////////////////////////////////
function 
LogEvent(str) {
    var divElement;

    // If the Logging HTML element is not present, then do no logging.
    divElement = document.getElementById("EventLog");
    if (!divElement) {
        return;
    }

    var brNode = document.createElement("br");
    divElement.appendChild(brNode);
    
    var textNode = document.createTextNode(str);
    divElement.appendChild(textNode);
} // LogEvent




////////////////////////////////////////////////////////////////////////////////
//
// [Util_ReadURLIntoXML]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_ReadURLIntoXML(url) {
    LogEvent("Util_ReadURLIntoXML. url=" + url);

    var httpRequest = new XMLHttpRequest();
    httpRequest.onload = function() { dump(httpRequest.responseXML.documentElement.nodeName); }
    httpRequest.onerror = function() { dump("Error while getting XML."); }

    httpRequest.open("GET", url);
    httpRequest.responseType = "document";
    httpRequest.send();

    LogEvent("Util_ReadURLIntoXML. Called httpRequest.send()");
    LogEvent("Util_ReadURLIntoXML. httpRequest=" + httpRequest);
    LogEvent("Util_ReadURLIntoXML. httpRequest.responseXML=" + httpRequest.responseXML);
    LogEvent("Util_ReadURLIntoXML. httpRequest.responseXML.documentElement=" + httpRequest.responseXML.documentElement);
    // httpRequest.responseXML is a Document instance.
    var docElement = httpRequest.responseXML.documentElement;
    
    LogEvent("Util_ReadURLIntoXML. xxxx");
    var rootXMLNode = Util_GetChildNode(docElement, "XML");    
    LogEvent("Util_ReadURLIntoXML. xxxx");
    return(rootXMLNode);
} // Util_ReadURLIntoXML





////////////////////////////////////////////////////////////////////////////////
//
// [Util_ParseStringIntoXML]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_ParseStringIntoXML(xmlTextString) {
    var xmlParser = null;
    var xmlDoc = null;
    // This is in descending order, from most preferred to least preferred.
    // We stop looking through the list when one is available
    var MicrosoftDOMObjectNameList = [
                    "Msxml2.DOMDocument.6.0", 
                    "Msxml2.DOMDocument.5.0", 
                    "Msxml2.DOMDocument.4.0", 
                    "Msxml2.DOMDocument.3.0", 
                    "MSXML2.DOMDocument", 
                    "MSXML.DOMDocument"
                    ];
    var currentObjectName;
    //LogEvent("Util_ParseStringIntoXML. xmlTextString=" + xmlTextString);
    //LogEvent("typedef = " + typeof(ActiveXObject));

    // This should work for all browsers except old versions of Internet Explorer.
    if (window.DOMParser) {
        //LogEvent("Util_ParseStringIntoXML. Try window.DOMParser");
        xmlParser = new DOMParser();
        if (xmlParser) {
            try { xmlDoc = xmlParser.parseFromString(xmlTextString, "text/xml"); } catch (e) {xmlDoc = null;}; 
            if (xmlDoc) {
                //LogEvent("Util_ParseStringIntoXML succeeded parsing as text/xml");
                return(xmlDoc);
            }
            try { xmlDoc = xmlParser.parseFromString(xmlTextString, "application/xml"); } catch (e) {xmlDoc = null;}; 
            if (xmlDoc) {
                //LogEvent("Util_ParseStringIntoXML succeeded parsing as application/xml");
                return(xmlDoc);
            }
            try { xmlDoc = xmlParser.parseFromString(xmlTextString, "text/html"); } catch (e) {xmlDoc = null;}; 
            if (xmlDoc) {
                //LogEvent("Util_ParseStringIntoXML succeeded parsing as text/html");
                return(xmlDoc);
            }
        }
    } // if (window.DOMParser)

    // If we did not succeed, then this may be because we are running in an
    // old version of Internet Explorer. In that case, try to load an older
    // Microsoft-specific version of the DOM.            
    for (var index = 0; index < MicrosoftDOMObjectNameList.length; index++) {
        currentObjectName = MicrosoftDOMObjectNameList[index];
        try { xmlDoc = new ActiveXObject(currentObjectName); } catch(e) {xmlDoc = null;}; 
        if (xmlDoc) {
            //LogEvent("Util_ParseStringIntoXML succeeded with " + currentObjectName);
            xmlDoc.loadXML(xmlTextString);
            return(xmlDoc);
        }
    }

    Main_InternalError("No XML Parser is installed");
    return(null);
} // Util_ParseStringIntoXML





////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetChildNode]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetChildNode(parentNode, childName) {
    var childElement;
    //LogEvent("Util_GetChildNode. childName=" + childName);

    if ((null == parentNode) || (null == childName)) {
        LogEvent("Util_GetChildNode. null params. childName=" + childName);
        return(null);
    }

    // Normalize everything to upper case, so we can have a case-insensitive comparison.
    childName = childName.toUpperCase();
    childElement = parentNode.firstChild;
    //LogEvent("Util_GetChildNode. childElement=" + childElement);
    while (childElement) {
        //LogEvent("Util_GetChildNode. childElement.nodeType=" + childElement.nodeType);
        // Look further at elements of type html-object/tag
        if (childElement.nodeType == 1) {
            var currentName = childElement.tagName;
            //LogEvent("Util_GetChildNode. currentName=" + currentName);
            if (currentName.toUpperCase() == childName) {
                return(childElement);
            }
        }
        childElement = childElement.nextSibling;
    } // while (childElement)

    return(null);
} // Util_GetChildNode









////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetNumChildNodes]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetNumChildNodes(parentNode, childName) {
    var childElement;
    var count = 0;

    if ((null == parentNode) || (null == childName)) {
        LogEvent("Util_GetNumChildNodes. null params");
        return(null);
    }

    // Normalize everything to upper case, so we can have a case-insensitive comparison.
    childName = childName.toUpperCase();
    childElement = parentNode.firstChild;
    //LogEvent("Util_GetNumChildNodes. childElement=" + childElement);
    while (childElement) {
        // Look further at elements of type html-object/tag
        if (childElement.nodeType == 1) {
            var currentName = childElement.tagName;
            if (currentName.toUpperCase() == childName) {
                count += 1;
            }
        }
        childElement = childElement.nextSibling;
    } // while (childElement)

    return(count);
} // Util_GetNumChildNodes






////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetNthChildNode]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetNthChildNode(parentNode, childName, targetIndex) {
    //LogEvent("Util_GetNthChildNode. childName=" + childName);
    var childElement;
    var index;

    if ((null == parentNode) || (null == childName)) {
        LogEvent("Util_GetNthChildNode. null params");
        return(null);
    }

    // Normalize everything to upper case, so we can have a case-insensitive comparison.
    childName = childName.toUpperCase();
    childElement = parentNode.firstChild;
    index = -1;
    //LogEvent("Util_GetNthChildNode. childElement=" + childElement);
    while (childElement) {
        //LogEvent("Util_GetNthChildNode. childElement.nodeType=" + childElement.nodeType);
        // Look further at elements of type html-object/tag
        if (childElement.nodeType == 1) {
            var currentName = childElement.tagName;
            //LogEvent("Util_GetNthChildNode. currentName=" + currentName);
            if (currentName.toUpperCase() == childName) {
                index += 1;
                //LogEvent("Util_GetNthChildNode. index=" + index);
                if (index == targetIndex) {
                    return(childElement);
                }
            }
        }
        childElement = childElement.nextSibling;
    } // while (childElement)

    return(null);
} // Util_GetNthChildNode




////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetLastChildNode]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetLastChildNode(parentNode, childName) {
    //LogEvent("Util_GetLastChildNode. childName=" + childName);
    var childElement;

    if ((null == parentNode) || (null == childName)) {
        LogEvent("Util_GetLastChildNode. null params");
        return(null);
    }

    // Normalize everything to upper case, so we can have a case-insensitive comparison.
    childName = childName.toUpperCase();
    childElement = parentNode.lastChild;
    //LogEvent("Util_GetLastChildNode. childElement=" + childElement);
    while (childElement) {
        //LogEvent("Util_GetLastChildNode. childElement.nodeType=" + childElement.nodeType);
        // Look further at elements of type html-object/tag
        if (childElement.nodeType == 1) {
            var currentName = childElement.tagName;
            //LogEvent("Util_GetLastChildNode. currentName=" + currentName);
            if (currentName.toUpperCase() == childName) {
                return(childElement);
            }
        }
        childElement = childElement.previousSibling;
    } // while (childElement)

    return(null);
} // Util_GetLastChildNode







////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetPeerNode]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetPeerNode(startNode, peerName) {
    //LogEvent("Util_GetPeerNode: peerName=" + peerName);
    var peerElement;
    var currentName;

    if (!startNode) {
        Main_InternalError("Util_GetPeerNode: Null startNode. peerName = " + peerName);
        return(null);
    }
    if (!peerName) {
        Main_InternalError("Util_GetPeerNode: Null peerName");
        return(null);
    }

    // Normalize everything to upper case, so we can have a case-insensitive comparison.
    peerName = peerName.toUpperCase();

    peerElement = startNode.nextSibling;
    while (peerElement) {
        // Look further at elements of type html-object/tag
        if (peerElement.nodeType == 1) {
            currentName = peerElement.tagName;
            //LogEvent("Util_GetPeerNode: currentName=" + currentName);
            if (currentName.toUpperCase() == peerName) {
                return(peerElement);
            }
        }
        peerElement = peerElement.nextSibling;
    } // while (peerElement)

    return(null);
} // Util_GetPeerNode







////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetAncestorNode]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetAncestorNode(childNode, ancestorName) {
    //LogEvent("Util_GetAncestorNode. ancestorName=" + ancestorName);
    var parentNode;

    if ((null == childNode) || (null == ancestorName)) {
        LogEvent("Util_GetAncestorNode. null params");
        return(null);
    }

    // Normalize everything to upper case, so we can have a case-insensitive comparison.
    ancestorName = ancestorName.toUpperCase();
    parentNode = childNode.parentNode;
    //LogEvent("Util_GetAncestorNode. parentNode=" + parentNode);
    while (parentNode) {
        //LogEvent("Util_GetAncestorNode. parentNode.nodeType=" + parentNode.nodeType);
        // Look further at elements of type html-object/tag
        if (parentNode.nodeType == 1) {
            var currentName = parentNode.tagName;
            //LogEvent("Util_GetAncestorNode. currentName=" + currentName);
            if (currentName.toUpperCase() == ancestorName) {
                return(parentNode);
            }
        }
        parentNode = parentNode.parentNode;
    } // while (parentNode)

    return(null);
} // Util_GetAncestorNode





////////////////////////////////////////////////////////////////////////////////
//
// [Util_RemoveNamedChildNodes]
//
////////////////////////////////////////////////////////////////////////////////
function
Util_RemoveNamedChildNodes(parentNode, childName) {
    var childElement;
    var nextChildElement;
    var currentName;
    //LogEvent("Util_RemoveNamedChildNodes: Parent=" + parentNode.tagName + ", childName=" + childName);
    
    if ((!parentNode) || (!childName)) {
        return;
    }

    // Normalize everything to upper case, so we can have a case-insensitive comparison.
    childName = childName.toUpperCase();

    childElement = parentNode.firstChild;
    while (null != childElement) {
        // Save the next peer node first, so it will be valid even if we delete the current node.
        nextChildElement = childElement.nextSibling;
        
        // Look further at elements of type html-object/tag
        if (childElement.nodeType == 1) {
            currentName = childElement.tagName;
            if ((currentName) && (currentName.toUpperCase() == childName)) {
                //LogEvent("Util_RemoveNamedChildNodes: Remove element " + currentName);
                parentNode.removeChild(childElement);
            }
        } // if (childElement.nodeType == 1)

        childElement = nextChildElement;
    } // while (null != childElement)
} // Util_RemoveNamedChildNodes




////////////////////////////////////////////////////////////////////////////////
//
// [Util_RemoveAllChildNodes]
//
////////////////////////////////////////////////////////////////////////////////
function
Util_RemoveAllChildNodes(parentNode) {
    var childElement;
    var nextChildElement;

    if (!parentNode) {
        return;
    }

    childElement = parentNode.firstChild;
    while (childElement) {
        nextChildElement = childElement.nextSibling;
        parentNode.removeChild(childElement);
        childElement = nextChildElement;
    } // while (childElement)
} // Util_RemoveAllChildNodes






////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetOrCreateChildNode]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetOrCreateChildNode(parentNode, childName, textStr) {
    var childNode = null;

    if (!parentNode) {
        return(null);
    }

    childNode = Util_GetChildNode(parentNode, childName);
    if (!childNode) {
        childNode = document.createElement(childName);
        parentNode.appendChild(childNode);
    }
    
    if (textStr) {  
        Util_RemoveAllChildNodes(childNode);
        var textElement = document.createTextNode(textStr);
        childNode.appendChild(textElement);
    }

    return(childNode);
} // Util_GetOrCreateChildNode




////////////////////////////////////////////////////////////////////////////////
//
// [Util_CreateChildNode]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_CreateChildNode(parentNode, childName) {
    var childNode = null;

    if (!parentNode) {
        return(null);
    }

    childNode = document.createElement(childName);
    parentNode.appendChild(childNode);

    return(childNode);
} // Util_CreateChildNode


   

////////////////////////////////////////////////////////////////////////////////
//
// [Util_SetTextContents]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_SetTextContents(parentNode, str) {
    var textNode;
    //LogEvent("Util_SetTextContents");
    //LogEvent("Util_SetTextContents. parentNode=" + parentNode);
    //LogEvent("Util_SetTextContents. str=" + str);
    
    if (parentNode) {
        Util_RemoveAllChildNodes(parentNode);
        textNode = document.createTextNode(str);
        parentNode.appendChild(textNode);
    }
} // Util_SetTextContents





////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetTextContents]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetTextContents(parentNode) {
    var currentNode;
    //LogEvent("Util_GetTextContents. parentNode=" + parentNode);

    var currentNode = parentNode.firstChild;
    while (currentNode) {
        //LogEvent("Util_GetTextContents.currentNode.nodeType=" + currentNode.nodeType);
        if (currentNode.nodeType == 3) {
            //LogEvent("Util_GetTextContents. currentNode.nodeValue=" + currentNode.nodeValue);
            return(currentNode.nodeValue);
        } // if (currentNode.nodeType == 3)

        if (currentNode.nodeType == 1) {
            //LogEvent("Util_GetTextContents. currentNode.nodeName=" + currentNode.nodeName);
        } // if (currentNode.nodeType == 1)

        currentNode = currentNode.nextSibling;
    } // while (currentNode)

    return(null);
} // Util_GetTextContents





////////////////////////////////////////////////////////////////////////////////
//
// [Util_NodeHasChildNodes]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_NodeHasChildNodes(parentNode) {
    var currentNode;
    //LogEvent("Util_NodeHasChildNodes. parentNode=" + parentNode);

    var currentNode = parentNode.firstChild;
    while (currentNode) {
        //LogEvent("Util_NodeHasChildNodes.currentNode.nodeType=" + currentNode.nodeType);
        if (currentNode.nodeType == 1) {
            //LogEvent("Util_NodeHasChildNodes. currentNode.nodeName=" + currentNode.nodeName);
            return(true);
        } // if (currentNode.nodeType == 1)

        currentNode = currentNode.nextSibling;
    } // while (currentNode)

    return(false);
} // Util_NodeHasChildNodes






////////////////////////////////////////////////////////////////////////////////
//
// [Util_SetChildNodeText]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_SetChildNodeText(parentNode, childName, textStr) {
    var childElement;
    //LogEvent("Util_SetChildNodeText. childName=" + childName + ", textStr=" + textStr);

    if ((!parentNode) || (!childName)) {
        Main_InternalError("Util_SetChildNodeText: Null parentNode");
        return;
    }

    childElement = Util_GetOrCreateChildNode(parentNode, childName, null);
    if (childElement) {
        Util_RemoveAllChildNodes(childElement);
        var textNode = document.createTextNode(textStr);
        childElement.appendChild(textNode);
    } else {
        Main_InternalError("Util_SetChildNodeText: Null childElement");
    }
} // Util_SetChildNodeText





////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetChildNodeText]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetChildNodeText(parentNode, childName) {
    var childElement;
    var pStr = null;
    //LogEvent("Util_GetChildNodeText.");

    childElement = Util_GetChildNode(parentNode, childName);
    //LogEvent("Util_GetChildNodeText. childElement=" + childElement);
    if (null == childElement) {
        return(null);
    }
    
    //LogEvent("Util_GetChildNodeText. childElement.textContent");
    try { pStr = childElement.textContent; } catch (e) {pStr = null;}; 
    if (pStr) {
        //LogEvent("Util_GetChildNodeText. textContent returned");
        //LogEvent("Util_GetChildNodeText. pStr=" + pStr);
        return(pStr);
    }
    
    //LogEvent("Util_GetChildNodeText. childElement.innerText");
    try { pStr = childElement.innerText; } catch (e) {pStr = null;}; 
    if (pStr) {
        //LogEvent("Util_GetChildNodeText. innerText returned");
        //LogEvent("Util_GetChildNodeText. pStr=" + pStr);
        return(pStr);
    }
    
    //LogEvent("Util_GetChildNodeText. childElement.firstChild");
    var currentNode = childElement.firstChild;
    while (currentNode) {
        //LogEvent("Util_GetChildNodeText. currentNode.nodeType=" + currentNode.nodeType);
        if (currentNode.nodeType == 3) {
            //LogEvent("Util_GetChildNodeText. currentNode.nodeValue=" + currentNode.nodeValue);
            return(currentNode.nodeValue);
        } // if (currentNode.nodeType == 3)
        currentNode = currentNode.nextSibling;
    } // while (currentNode)

    return(pStr);
} // Util_GetChildNodeText






////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetChildNodeTextEx]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetChildNodeTextEx(parentNode, childName, defaultVal) {
    var valStr = null;

    valStr = Util_GetChildNodeText(parentNode, childName);
    if (null == valStr) {
        return(defaultVal);
    } 

    return(valStr);
} // Util_GetChildNodeTextEx







////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetNodeText]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetNodeText(parentNode) {
    var pStr = null;
    //LogEvent("Util_GetNodeText.");
    
    //LogEvent("Util_GetNodeText. parentNode.textContent");
    try { pStr = parentNode.textContent; } catch (e) {pStr = null;}; 
    if (pStr) {
        //LogEvent("Util_GetNodeText. textContent returned");
        //LogEvent("Util_GetNodeText. pStr=" + pStr);
        return(pStr);
    }
    
    //LogEvent("Util_GetNodeText. parentNode.innerText");
    try { pStr = parentNode.innerText; } catch (e) {pStr = null;}; 
    if (pStr) {
        //LogEvent("Util_GetNodeText. innerText returned");
        //LogEvent("Util_GetNodeText. pStr=" + pStr);
        return(pStr);
    }
    
    //LogEvent("Util_GetNodeText. parentNode.firstChild");
    var currentNode = parentNode.firstChild;
    while (currentNode) {
        //LogEvent("Util_GetNodeText. currentNode.nodeType=" + currentNode.nodeType);
        if (currentNode.nodeType == 3) {
            //LogEvent("Util_GetNodeText. currentNode.nodeValue=" + currentNode.nodeValue);
            return(currentNode.nodeValue);
        } // if (currentNode.nodeType == 3)
        currentNode = currentNode.nextSibling;
    } // while (currentNode)

    return(pStr);
} // Util_GetNodeText






////////////////////////////////////////////////////////////////////////////////
//
// [Util_SetNodeText]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_SetNodeText(elementNode, textStr) {
    //LogEvent("Util_SetNodeText. elementNode=" + elementNode + ", textStr=" + textStr);
    if (elementNode) {
        Util_RemoveAllChildNodes(elementNode);
        var textNode = document.createTextNode(textStr);
        elementNode.appendChild(textNode);
    } else {
        Main_InternalError("Util_SetNodeText: Null elementNode");
    }
} // Util_SetNodeText







////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetInputNumber]
//
////////////////////////////////////////////////////////////////////////////////
function
Util_GetInputNumber(elementName, defaultValue) {
    if (!elementName) {
        return(defaultValue);
    }

    var inputElement = document.getElementById(elementName);
    if (!inputElement) {
        return(defaultValue);
    }

    var inputText = inputElement.value;
    if (inputText == "") {
        return(defaultValue);
    } 
    // Remove commas. These separate mantissa from fraction in some scripts, which
    // is confusing to people using the US style.
    inputText = inputText.replaceAll(',', '');

    return(parseFloat(inputText));
} // Util_GetInputNumber





////////////////////////////////////////////////////////////////////////////////
//
// [Util_SetInputStr]
//
////////////////////////////////////////////////////////////////////////////////
function
Util_SetInputStr(elementName, valueStr) {
    if (!elementName) {
        return;
    }

    var inputElement = document.getElementById(elementName);
    if (inputElement) {
        inputElement.value = valueStr;
    }
} // Util_SetInputStr






////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetNamedPrevPeer]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetNamedPrevPeer(startNode, peerName) {
    var peerElement;
    var currentName;

    if (!startNode) {
        LogError("Util_GetNamedPrevPeer: Null startNode. peerName = " + peerName);
        return(null);
    }
    if (!peerName) {
        LogError("Util_GetNamedPrevPeer: Null peerName");
        return(null);
    }

    // Normalize everything to upper case, so we can have a case-insensitive comparison.
    peerName = peerName.toUpperCase();
    peerElement = startNode.previousSibling;
    while (peerElement) {
        // Look further at elements of type html-object/tag
        if (peerElement.nodeType == 1) {
            currentName = peerElement.tagName;
            if (currentName.toUpperCase() == peerName) {
                return(peerElement);
            }
        }
        peerElement = peerElement.previousSibling;
    } // while (peerElement)

    return(null);
} // Util_GetNamedPrevPeer




////////////////////////////////////////////////////////////////////////////////
//
// [Main_InternalError]
//
////////////////////////////////////////////////////////////////////////////////
function 
Main_InternalError(msg) {
    return;
}




////////////////////////////////////////////////////////////////////////////////
//
// [Util_InitToggleState]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_InitToggleState(textId) {
    var spanNode;
    var textNode;
    var pStr = null;
    var fToggleState = false;
    
    spanNode = document.getElementById(textId);    
    pStr = Util_GetNodeText(spanNode);
    if (pStr) {
        pStr = pStr.toUpperCase();
        if (pStr == "ON") {
            fToggleState = true;
        } else {
            fToggleState = false;
        }
    }

    Util_RemoveAllChildNodes(spanNode);
    if (fToggleState) {
        textNode = document.createTextNode("ON");
        spanNode.style="background-color:#00FF00;"
    } else {
        textNode = document.createTextNode("OFF");
        spanNode.style="background-color:#FF0000;"
    }    
    spanNode.appendChild(textNode);

    return(fToggleState);
} // Util_InitToggleState





////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetToggleState]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetToggleState(textId) {
    var spanNode;
    var pStr = null;
    var fToggleState = false;
    //LogEvent("Util_SetChildNodeText. parentNode=" + parentNode + ", str=" + str);
    
    spanNode = document.getElementById(textId);    
    pStr = Util_GetNodeText(spanNode);
    if (pStr) {
        pStr = pStr.toUpperCase();
        if (pStr == "ON") {
            fToggleState = true;
        } else {
            fToggleState = false;
        }
    }

    return(fToggleState);
} // Util_GetToggleState






////////////////////////////////////////////////////////////////////////////////
//
// [Util_SwitchToggleState]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_SwitchToggleState(textId) {
    var spanNode;
    var textNode;
    var pStr = null;
    var fToggleState = false;
    //LogEvent("Util_SwitchToggleState, textId = " + textId);
            
    spanNode = document.getElementById(textId);    
    pStr = Util_GetNodeText(spanNode);
    if (pStr) {
        pStr = pStr.toUpperCase();
        if (pStr == "ON") {
            fToggleState = false;
        } else {
            fToggleState = true;
        }
    }

    Util_RemoveAllChildNodes(spanNode);
    if (fToggleState) {
        textNode = document.createTextNode("ON");
        spanNode.style="background-color:#00FF00;"
    } else {
        textNode = document.createTextNode("OFF");
        spanNode.style="background-color:#FF0000;"
    }    
    spanNode.appendChild(textNode);

    return(fToggleState);
} // Util_SwitchToggleState






////////////////////////////////////////////////////////////////////////////////
//
// [Util_AddOptionToComboBox]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_AddOptionToComboBox(selectList, optionName, optionValue) {
    var selectItem;
    var textNode;
    //LogEvent("Util_AddOptionToComboBox");
    
    selectItem = document.createElement("option");
    selectItem.setAttribute("Value", optionValue);

    textNode = document.createTextNode(optionName);
    selectItem.appendChild(textNode);

    selectList.appendChild(selectItem); 
} // Util_AddOptionToComboBox







////////////////////////////////////////////////////////////////////////////////
//
// [Util_PrintXMLTreeToElement]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_PrintXMLTreeToElement(pNode, elementName) {
    var textInputElement;
    var xmlText;

    textInputElement = document.getElementById(elementName);
    if (!textInputElement) {
        return;
    }

    xmlText = Util_PrintXMLTreeToString(pNode, 0, "");
    textInputElement.textContent = xmlText;
} // Util_PrintXMLTreeToElement





////////////////////////////////////////////////////////////////////////////////
//
// [Util_PrintXMLTreeToString]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_PrintXMLTreeToString(pNode, indentLevel, currentText) {
    var newlineText = "\n";
    var indentSpace = "    ";
    var index;
    var childElement;
    //LogEvent("Util_PrintXMLTreeToString.");
    
    if (!pNode) {
        return("");
    }

    //////////////////////////////////////////
    // Text Node        
    if (pNode.nodeType == 3) {
        currentText = currentText + newlineText;
        for (index = 0; index < indentLevel; index += 1) {
            currentText = currentText + indentSpace;
        }
        currentText = currentText + pNode.nodeValue;
        return(currentText);
    } // if (pNode.nodeType == 3)

     
    if (pNode.nodeType != 1) {
        return(currentText);
    } // if (pNode.nodeType == 3)


    currentText = currentText + newlineText;
    for (index = 0; index < indentLevel; index += 1) {
        currentText = currentText + indentSpace;
    }    
    currentText = currentText + "<" + pNode.nodeName + ">";

    // Print every child.
    childElement = pNode.firstChild;
    while (childElement) {
        currentText = Util_PrintXMLTreeToString(childElement, indentLevel + 1, currentText);
        childElement = childElement.nextSibling;
    } // while (childElement)

    currentText = currentText + newlineText;
    for (index = 0; index < indentLevel; index += 1) {
        currentText = currentText + indentSpace;
    }    
    currentText = currentText + "</" + pNode.nodeName + ">";


    return(currentText);
} // Util_PrintXMLTreeToString





////////////////////////////////////////////////////////////////////////////////
//
// [Util_RoundNumber]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_RoundNumber(value) {
    var result = Math.round(value * 100) / 100;
    return(result);
} // Util_RoundNumber





////////////////////////////////////////////////////////////////////////////////
//
// [Util_SetTextEditElement]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_SetTextEditElement(elementName, intVal) {
    var textElement;

    // If the Logging HTML element is not present, then do no logging.
    textElement = document.getElementById(elementName);
    if (textElement) {
        textElement.value = intVal.toString();
    }
} // Util_SetTextEditElement





////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetTextEditValue]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetTextEditValue(elementName) {
    var textElement;

    // If the Logging HTML element is not present, then do no logging.
    textElement = document.getElementById(elementName);
    if (textElement) {
        return(textElement.value);
    }

    return(null);
} // Util_GetTextEditValue




////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetDescendantNodeByID]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetDescendantNodeByID(parentNode, targetID) {
    var childElement;
    var recursiveResult;

    if ((null == parentNode) || (null == targetID)) {
        LogEvent("Util_GetDescendantNodeByID. null params. targetID=" + targetID);
        return(null);
    }

    childElement = parentNode.firstChild;
    //LogEvent("Util_GetChildNode. childElement=" + childElement);
    while (childElement) {
        // Look further at elements of type html-object/tag
        if (childElement.nodeType == 1) {
            if (childElement.id == targetID) {
                return(childElement);
            }

            recursiveResult = Util_GetDescendantNodeByID(childElement, targetID);
            if (recursiveResult) {
                return(recursiveResult);
            }
        } // if (childElement.nodeType == 1)

        childElement = childElement.nextSibling;
    } // while (childElement)

    return(null);
} // Util_GetDescendantNodeByID




////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetDescendantNodeByXID]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetDescendantNodeByXID(parentNode, targetID) {
    //LogEvent("Util_GetDescendantNodeByXID. targetID=" + targetID);
    var childElement;
    var recursiveResult;
    var attrValue;    

    if ((null == parentNode) || (null == targetID)) {
        //LogEvent("Util_GetDescendantNodeByXID. null params");
        return(null);
    }

    childElement = parentNode.firstChild;
    //LogEvent("Util_GetDescendantNodeByXID. childElement=" + childElement);
    while (childElement) {
        // Look further at elements of type html-object/tag
        if (childElement.nodeType == 1) {
            attrValue = childElement.getAttribute('xID');
            if ((attrValue) && (attrValue == targetID)) {
                return(childElement);
            }

            recursiveResult = Util_GetDescendantNodeByXID(childElement, targetID);
            if (recursiveResult) {
                return(recursiveResult);
            }
        } // if (childElement.nodeType == 1)

        childElement = childElement.nextSibling;
    } // while (childElement)

    return(null);
} // Util_GetDescendantNodeByXID





////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetAncestorNodeByxID]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetAncestorNodeByxID(childNode, ancestorName) {
    //LogEvent("Util_GetAncestorNodeByxID. ancestorName=" + ancestorName);
    var parentNode;
    var attrValue;

    if ((null == childNode) || (null == ancestorName)) {
        //LogEvent("Util_GetAncestorNodeByxID. null params");
        return(null);
    }
    
    // Normalize everything to upper case, so we can have a case-insensitive comparison.
    ancestorName = ancestorName.toUpperCase();
    parentNode = childNode.parentNode;

    //LogEvent("Util_GetAncestorNodeByxID. ancestorName=" + ancestorName);
    //LogEvent("Util_GetAncestorNodeByxID. parentNode=" + parentNode);
    while (parentNode) {
        //LogEvent("Util_GetAncestorNodeByxID. parentNode.nodeType=" + parentNode.nodeType);
        // Look further at elements of type html-object/tag
        if (parentNode.nodeType == 1) {
            attrValue = parentNode.getAttribute('xID');
            //LogEvent("Util_GetAncestorNodeByxID. attrValue=" + attrValue);
            if ((attrValue) && (attrValue.toUpperCase() == ancestorName)) {
                return(parentNode);
            }
        }

        parentNode = parentNode.parentNode;
    } // while (parentNode)

    return(null);
} // Util_GetAncestorNodeByxID






////////////////////////////////////////////////////////////////////////////////
//
// [Util_GetPeerNodeByxID]
//
////////////////////////////////////////////////////////////////////////////////
function 
Util_GetPeerNodeByxID(startNode, peerName) {
    //LogEvent("Util_GetPeerNodeByxID. peerName=" + peerName);
    var peerNode;
    var attrValue;

    if ((null == startNode) || (null == peerName)) {
        LogEvent("Util_GetPeerNodeByxID. null params");
        return(null);
    }
    ///LogEvent("Util_GetPeerNodeByxID. startNode=" + startNode);
    //LogEvent("Util_GetPeerNodeByxID. startNode Type=" + startNode.nodeType);
    //LogEvent("Util_GetPeerNodeByxID. startNode Name=" + startNode.nodeName);
    //LogEvent("Util_GetPeerNodeByxID. startNode id=" + startNode.getAttribute('id'));
    //LogEvent("Util_GetPeerNodeByxID. startNode xID=" + startNode.getAttribute('xID'));
    
    // Normalize everything to upper case, so we can have a case-insensitive comparison.
    peerName = peerName.toUpperCase();
    peerNode = startNode.nextElementSibling;
    while (peerNode) {
        //LogEvent("Util_GetPeerNodeByxID. peerNode.nodeType=" + peerNode.nodeType);
        // Look further at elements of type html-object/tag
        if (peerNode.nodeType == 1) {
            attrValue = peerNode.getAttribute('xID');
            //LogEvent("Util_GetPeerNodeByxID. attrValue=" + attrValue);
            if ((attrValue) && (attrValue.toUpperCase() == peerName)) {
                return(peerNode);
            }
        }

        peerNode = peerNode.nextElementSibling;
    } // while (peerNode)

    //LogEvent("Util_GetPeerNodeByxID. Hit NULL node");
    return(null);
} // Util_GetPeerNodeByxID



