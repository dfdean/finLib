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
################################################################################
import sys
from datetime import datetime

# Yahoo Finance
import yfinance as yf

g_libDirPath = "/home/ddean/ddRoot/lib"
# Allow import to pull from the per-user lib directory.
#print("g_libDirPath = " + g_libDirPath)
#if g_libDirPath not in sys.path:
#    sys.path.insert(0, g_libDirPath)

YAHOO_FINANCE = "yahoo"

import stockTicker as StockTicker






################################################################################
#
# [LoadTickerFromYahoo]
#
# Load a single ticker. All yahoo-specific dependencies should be encapsulated here.
################################################################################
def LoadTickerFromYahoo(stockTicker):
    fDebug = False
    fSuccess = False
    fRetry = False
    if (fDebug):
        print("CYahooTicker.Load")

    remoteTicker = yf.Ticker(stockTicker.GetStockSymbol())
    if (remoteTicker is None):
        print("LoadTickerFromYahoo. remoteTicker is None. Symbol=" + stockTicker.GetStockSymbol())
        fRetry = True
        return fSuccess, fRetry            
    tickerInfo = remoteTicker.info
    if (tickerInfo is None):
        print("LoadTickerFromYahoo. tickerInfo is None. Symbol=" + stockTicker.GetStockSymbol())
        fRetry = True
        return fSuccess, fRetry            
    if (fDebug):
        print("   remoteTicker=" + str(remoteTicker))
        print("   tickerInfo=" + str(tickerInfo))

    #######################
    # Get basic information about the Stock.
    # Some tickers, like some of the ETF's or cryptos, do not have all values.
    try:
        stockTicker.SetCompanyName(tickerInfo['shortName'])
    except Exception:
        stockTicker.SetCompanyName(stockTicker.GetStockSymbol())

    #########################
    try:
        stockTicker.SetCurrentPrice(tickerInfo['currentPrice'])
    except Exception:
        try:
            stockTicker.SetCurrentPrice(tickerInfo['regularMarketOpen'])
        except Exception:
            try:
                stockTicker.SetCurrentPrice(tickerInfo['previousClose'])
            except Exception:
                print("LoadTickerFromYahoo. No Price Info. TickerInfo=" + str(tickerInfo))
                return fSuccess, fRetry

    #########################
    try:
        stockTicker.SetPrevClose(tickerInfo['previousClose'])
    except Exception:
        print("   TickerInfo=" + str(tickerInfo))
        print("Caught Exception 2a")
        return fSuccess, fRetry

    #########################
    try:
        stockTicker.SetTodayOpenPrice(tickerInfo['open'])
    except Exception:
        print("   TickerInfo=" + str(tickerInfo))
        print("Caught Exception 2b")
        return fSuccess, fRetry

    #########################
    try:
        stockTicker.SetTodayLowPrice(tickerInfo['dayLow'])
    except Exception:
        print("   TickerInfo=" + str(tickerInfo))
        print("Caught Exception 2c")
        return fSuccess, fRetry

    #########################
    try:
        stockTicker.SetTodayHighPrice(tickerInfo['dayHigh'])
    except Exception:
        print("   TickerInfo=" + str(tickerInfo))
        print("Caught Exception 2d")
        return fSuccess, fRetry
    #########################
    try:
        stockTicker.SetVolume(tickerInfo['volume'])
    except Exception:
        print("   TickerInfo=" + str(tickerInfo))
        print("Caught Exception 2e")
        return fSuccess, fRetry
    #########################
    try:
        stockTicker.SetTrailingPE(tickerInfo['trailingPE'])
    except Exception:
        stockTicker.SetTrailingPE(-1)
    #########################
    try:
        stockTicker.SetForwardPE(tickerInfo['forwardPE'])
    except Exception:
        stockTicker.SetForwardPE(-1)
    #########################
    try:
        stockTicker.SetBid(tickerInfo['bid'])
    except Exception:
        stockTicker.SetBid(-1)
    #########################
    try:
        stockTicker.SetAsk(tickerInfo['ask'])
    except Exception:
        stockTicker.SetAsk(-1)
    #########################
    try:
        stockTicker.SetFiftyTwoWeekLow(tickerInfo['fiftyTwoWeekLow'])
        stockTicker.SetFiftyTwoWeekHigh(tickerInfo['fiftyTwoWeekHigh'])
        stockTicker.SetFiftyDayAverage (tickerInfo['fiftyDayAverage'])
        stockTicker.SetTwoHundredDayAverage(tickerInfo['twoHundredDayAverage'])
        stockTicker.SetAvgVolume(tickerInfo['averageVolume'])
    except Exception:
        print("Caught Exception 3")
        return fSuccess, fRetry
    #########################
    try:
        stockTicker.SetPEGRatio(tickerInfo['pegRatio'])
    except Exception:
        stockTicker.SetPEGRatio(0)

    #######################
    # Get historical market data. This returns a pandas.core.frame.DataFrame
    # This must be one of ['1d', '5d', '1mo', '3mo', 'ytd', 'max']
    hist = remoteTicker.history(period="max")
    # Each row is a pandas.core.frame.Pandas
    for row in hist.itertuples():
        currentTimeStamp = row[0]
        currentOpen = row[1]
        currentHigh = row[2]
        currentLow = row[3]
        currentClose = row[4]
        currentVolume = row[5]

        # The timestamp is a pandas._libs.tslibs.timestamps.Timestamp
        dateTime = currentTimeStamp.to_pydatetime()
        dateTimeDate = dateTime.date()

        if (fDebug):
            print("CYahooTicker.Load. row=" + str(row))
            print("dateTimeDate.year=" + str(dateTimeDate.year))

        stockTicker.SetPastValues(dateTimeDate.year, dateTimeDate.month, dateTimeDate.day, 
                                currentOpen, currentClose, currentVolume, 
                                currentHigh, currentLow, 0, 0, 0, 0, 0, 0, 0)
    # for row in hist.itertuples():


    #######################
    # Get options data
    if (False):
        stockTicker.SetOptionDates(remoteTicker.options)  #expiration dates
        self.OptionsList = []
        for dateStr in remoteTicker.options:
            if (fDebug):
                print("Options Date: " + dateStr)
            dateStrParts = dateStr.split('-')
            strikeDateYear = int(dateStrParts[0])
            strikeDateMonth = int(dateStrParts[1])
            strikeDateDay = int(dateStrParts[2])

            totalOptionInfo = self.Ticker.option_chain(dateStr)
            callOptionInfo = totalOptionInfo.calls
            putOptionInfo = totalOptionInfo.puts
            if (fDebug):
                print("callOptionChain = " + str(callOptionInfo))

            callOptionList = []
            for row in callOptionInfo.itertuples():
                lastTradeDateInPanda = row[2]
                dateTime = lastTradeDateInPanda.to_pydatetime()
                lastTradeDate = dateTime.date()
                ltdDateYear = lastTradeDate.year
                ltdDateMonth = lastTradeDate.month
                ltdDateDay = lastTradeDate.day

                strikePrice = row[3]
                bidPrice = row[5]
                askPrice = row[6]
                currentVolume = row[9]
                openInterest = row[10]
                newQueueEntry = {'s': strikePrice, 'bid': bidPrice, 'ask': askPrice, 
                                'vo': currentVolume, 'oi': openInterest,
                                'ltdY': ltdDateYear, 'ltdM': ltdDateMonth, 'ltdD': ltdDateDay }
                callOptionList.append(newQueueEntry)
                if (fDebug):
                    print("One CallInfo = " + str(newQueueEntry))
            # End - for row in callOptionInfo.itertuples():

            putOptionList = []
            for row in putOptionInfo.itertuples():
                if (fDebug):
                    print("put row = " + str(row))
                lastTradeDateInPanda = row[2]
                dateTime = lastTradeDateInPanda.to_pydatetime()
                lastTradeDate = dateTime.date()
                ltdDateYear = lastTradeDate.year
                ltdDateMonth = lastTradeDate.month
                ltdDateDay = lastTradeDate.day

                strikePrice = row[3]
                bidPrice = row[5]
                askPrice = row[6]
                currentVolume = row[9]
                openInterest = row[10]

                newQueueEntry = {'s': strikePrice, 'bid': bidPrice, 'ask': askPrice, 
                                'vo': currentVolume, 'oi': openInterest,
                                'ltdY': ltdDateYear, 'ltdM': ltdDateMonth, 'ltdD': ltdDateDay }
                putOptionList.append(newQueueEntry)
                if (fDebug):
                    print("One PutInfo = " + str(newQueueEntry))
            # End - for row in putOptionInfo.itertuples():

            newQueueEntry = {'strikeYear': strikeDateYear, 'strikeMonth': strikeDateMonth, 'strikeDay': strikeDateDay, 'calls': callOptionList, 'puts': putOptionList}
            self.OptionsList.append(newQueueEntry)
            if (fDebug):
                print("New Options Chain: " + str(newQueueEntry))
        # for dateStr in self.TickerOptionDates

    fSuccess = True
    fRetry = False
    if (fDebug):
        print("LoadTickerFromYahoo. fSuccess=" + str(fSuccess))
    return fSuccess, fRetry
# End - LoadTickerFromYahoo





#####################################################################################
#
# [OpenTickersForStocks]
#
#####################################################################################
def OpenTickersForStocks(tickerSourceName, stockNameList, stockTickerDict):
    fDebug = True

    tickerSourceName = tickerSourceName.lower()
    for tickerSymbol in stockNameList:
        #tickerSymbol = tickerSymbol.lower()
        if (fDebug):
            print("Allocate ticker for " + tickerSymbol)

        # We may combine several lists so avoid duplicates
        if ((stockTickerDict is not None) 
                and (tickerSymbol in stockTickerDict) 
                and (stockTickerDict[tickerSymbol] is not None)):
            continue

        # Make a new empty ticker
        currentTicker = StockTicker.CStockTicker(tickerSymbol)

        ###############################################
        # Now, load all information about this ticker
        attemptNum = 1
        maxAttempts = 5
        fSuccess = False
        fRetry = False
        while (attemptNum <= maxAttempts):
            try:    
                if (tickerSourceName == YAHOO_FINANCE):
                    fSuccess, fRetry = LoadTickerFromYahoo(currentTicker)
                else:
                    #print("OpenTickersForStocks. Unrecognized Loader: " + tickerSourceName)
                    attemptNum += 1
                    continue
            except Exception:
                print("Error. LoadTickerFromYahoo raised an exception!")
                print("  fSuccess = " + str(fSuccess))
                print("  attemptNum = " + str(attemptNum))
                attemptNum += 1
                continue
            # End try/except

            # We succeeded, or if there is no point to retrying, then stop trying
            if ((fSuccess) or (not fRetry)):
                break
        # End - while (attemptNum <= maxAttempts):

        if ((not fSuccess) or (attemptNum > maxAttempts)):
            currentTicker = None
            print("Error. Cannot find ticker: " + tickerSymbol)
            print("  fSuccess = " + str(fSuccess))
            print("  attemptNum = " + str(attemptNum))
            print("  maxAttempts = " + str(maxAttempts))
            continue

        currentTicker.ComputeAllStats()
        if (stockTickerDict is not None):
            stockTickerDict[tickerSymbol] = currentTicker
    # End - for securityInfoDict in stockNameList:


    return stockTickerDict
# End - OpenTickersForStocks

