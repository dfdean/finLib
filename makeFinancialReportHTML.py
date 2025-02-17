#!/usr/bin/python3
################################################################################
# 
# Copyright (c) 2024-2025 Dawson Dean
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
#
################################################################################
#
# Yahoo
# https://pypi.org/project/yfinance/
#
# Google Finance
# https://pypi.org/project/googlefinance/
#
# NASDAQ Data
# https://docs.data.nasdaq.com/docs/python
# https://docs.data.nasdaq.com/docs/python-tables
#
################################################################################
# Ideas to Explore
#
# Strategies
# - Miss 10 best or worst days
# - Buy when RSI is +, sell when negative
# - Dollar-cost average buy
# 
# - If daily drop is >= 50% of one of the 10 biggest drops in past 5 years, then sell.
#   Buy after the first day it is positive
#
# Daily cron job to download price info and load it into a file. 
#    Then, the CGI just reads it from the file
# Apache + mod_wsgi
#
# - Dependency graphs
#       A link is either a producer or consumer relationship or else a covariance
#       Time order the graphs, based on relative dates of earnings announcements or lags in effects
# So, event happens in node x, and what will be the downstream effects.
#
################################################################################
import sys
import copy
from datetime import datetime
from collections import deque

# Yahoo Finance
import yfinance as yf

import statistics
from scipy import stats
from scipy.stats import spearmanr
import numpy as np

g_libDirPath = "/home/ddean/ddRoot/lib"
# Allow import to pull from the per-user lib directory.
#print("g_libDirPath = " + g_libDirPath)
if g_libDirPath not in sys.path:
    sys.path.insert(0, g_libDirPath)

import dataShow as DataShow
import stockTicker as StockTicker
import stockTickerYahoo as StockTickerYahoo
import fileTemplate as FileTemplate


g_ResultFileDir = "/home/ddean/ddRoot/finLib/"

STAT_SCORE_CORRELATION_WITH_PRICE_T1 = "corrPriceT1"
STAT_SCORE_CORRELATION_WITH_PRICE_T4 = "corrPriceT4"

SP500_TICKER = '^GSPC'
YAHOO_FINANCE = "yahoo"

# OpCodes for GetExtremes
EXTREMES_MAX_PRICES = "maxPrices"
EXTREMES_MIN_PRICES = "minPrices"
EXTREMES_MAX_PRICE_CHANGES = "maxPriceChanges"
EXTREMES_MIN_PRICE_CHANGES = "minPriceChanges"

g_InterestingStockNameList = [
    # Semiconductors
    'NVDA',
    'INTC',
    'AMD',
    'TSM',
    'QCOM',
    'ARM',
    'AMAT',
    'ASML',

    # Software
    'GOOG',
    'MSFT',
    'AAPL',
    'META',
    'PLTR',
    'ORCL',
    'CRM',
    'ADBE',
    'INTU',
    'SMCI',

    # Control
    '^GSPC'
]




################################################################################
#
# MAIN
#
################################################################################
#startimeStr = str(datetime.now().time())
startimeStr = datetime.today().strftime("%A %B %d, %Y (%H:%M:%S)")
print("Started:" + startimeStr)  # g_Report.SetBodyStr

# Initialized the globals
g_Report = FileTemplate.MakeTemplate()
g_StockTickerList = {}
g_StockCovarianceList = { }



#################################################
if (True):
    # Load all Stock Tickers
    g_StockTickerList = StockTickerYahoo.OpenTickersForStocks("yahoo", g_InterestingStockNameList, g_StockTickerList)

    # Make the report
    g_Report.SetBodyStr("Collected " + startimeStr)
    g_Report.AddHTMLTableRowToDoc([ "<b>Stock</b>", "<b>Price</b>", "<b>Price Change</b>", "<b>RSI</b>", "<b>Stochastic</b>", "<b>MACD</b>", "<b>PEG</b>"])
    # , "<b>Bid-Ask Spread</b>"

    for index, (tickerName, stockInfo) in enumerate(g_StockTickerList.items()):
        tickerSymbolStr = stockInfo.GetStockSymbol()
        rsiScore = stockInfo.GetRSI()
        bidAskSpread, bidAskSpreadPercent = stockInfo.GetBidAskSpread()
        macdScore = stockInfo.GetMACD()
        kStoScore = stockInfo.GetKStochastic()
        pegScore = stockInfo.GetPEGRatio()
        percentChange, absChange = stockInfo.GetPrevDayChange()

        # Make the cell values, some of which are formatted strings.
        securityNameCellStr = "<a href=\"https://finance.yahoo.com/quote/" + tickerSymbolStr + "\">" + tickerSymbolStr + "</a>"
        if (percentChange > 0):
            percentChangeStr = "+" + str(percentChange) + "%  (" + str(absChange) + ")"
        else:
            percentChangeStr = str(percentChange) + "%  (" + str(absChange) + ")"
        #imgURL = "<a href=\"" + displayCovarInfo["Chart"] + "\">Chart</a>"
        bidAskStr = str(bidAskSpread) + "  (" + str(bidAskSpreadPercent) + "%)"

        g_Report.AddHTMLTableRowToDoc( [ securityNameCellStr, 
                g_Report.MakeColoredTableCellStrEx(stockInfo.GetCurrentPrice(), absChange, FileTemplate.GREATER_THAN, 0, FileTemplate.LESS_THAN, 0),
                g_Report.MakeColoredTableCellStrEx(percentChangeStr, percentChange, FileTemplate.GREATER_THAN, 0, FileTemplate.LESS_THAN, 0),
                g_Report.MakeColoredTableCellStr(rsiScore, FileTemplate.LESS_THAN, 30, FileTemplate.GREATER_THAN, 70),
                g_Report.MakeColoredTableCellStr(kStoScore, FileTemplate.LESS_THAN, 20, FileTemplate.GREATER_THAN, 80),
                g_Report.MakeColoredTableCellStr(macdScore, FileTemplate.GREATER_THAN, 0, FileTemplate.LESS_THAN, 0),
                g_Report.MakeColoredTableCellStr(pegScore, FileTemplate.LESS_THAN, 1, FileTemplate.GREATER_THAN, 1)
                ] )
                # bidAskStr

        # Make the Javascript table
        g_Report.AddJavascriptTableRow([ {"Name": "Name", "Value": stockInfo.GetStockSymbol() }, 
                        {"Name": "Price", "Value": stockInfo.GetCurrentPrice() }, 
                        {"Name": "PercentChange", "Value": percentChange }, 
                        {"Name": "AbsChange", "Value": absChange }, 
                        {"Name": "BidAskSpread", "Value": bidAskSpread },                    
                        {"Name": "PEG", "Value": pegScore }, 
                        {"Name": "RSI", "Value": rsiScore }, 
                        {"Name": "KStockastic", "Value": kStoScore }, 
                        {"Name": "MACD", "Value": macdScore } ])
    # End - for stockInfo in g_StockTickerList:

    g_Report.MakeFileFromTemplate("/home/ddean/ddRoot/finLib/stockTemplate.htm", 
                                    g_ResultFileDir + "stockReport.htm")

# End - if (True)

stopTimeStr = datetime.today().strftime("%A %B %d, %Y (%H:%M:%S)")
print("Stopped:" + stopTimeStr)  # g_Report.SetBodyStr

