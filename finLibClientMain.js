////////////////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2025 Dawson Dean
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
// This is the top-level module. It initiates the entire UI and also does all
// the layout of HTML elements in the UI. This layout is done initially when the 
// UI opens, but also may change the UI elements dynamically in response to user 
// actions.
/////////////////////////////////////////////////////////////////////////////


/////////////////////////
// HTML Elements
// These are the main windows that we show/hide to expose different subgroups of funtions and outputs.
var g_PlanDivElement = null;
var g_PlanTableElement = null;
var g_DiagnosisButtonsDivElement = null;
var g_HelpDivElement = null;
var g_OptionWindowDivElement = null;
var g_RecommendationsDivElement = null;
var g_InpatientTableElement = null;
var g_ToolBarElement = null;





////////////////////////////////////////////////////////////////////////////////
//
// [StartFinLib]
//
// This is called by the browser to initialize the entire UI.
////////////////////////////////////////////////////////////////////////////////
function 
StartFinLib() {
    LogEvent("Inside StartFinLib")

    // These are the main windows that we show/hide to expose different subgroups of funtions and outputs.
    // g_PlanDivElement = document.getElementById("NotePlanWindow");
} // StartFinLib




////////////////////////////////////////////////////////////////////////////////
//
// [OnTestButton]
//
////////////////////////////////////////////////////////////////////////////////
function 
OnTestButton(button) {
    LogEvent("OnTestButton");
} End - OnTestButton
