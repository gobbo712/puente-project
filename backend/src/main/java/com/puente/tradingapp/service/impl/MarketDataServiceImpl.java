package com.puente.tradingapp.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.puente.tradingapp.model.Instrument;
import com.puente.tradingapp.model.Instrument.InstrumentType;
import com.puente.tradingapp.repository.InstrumentRepository;
import com.puente.tradingapp.service.MarketDataService;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ParseException;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class MarketDataServiceImpl implements MarketDataService {

    private static final Logger logger = LoggerFactory.getLogger(MarketDataServiceImpl.class);
    private static final List<String> STOCK_SYMBOLS = Arrays.asList("AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META",
            "NVDA", "JPM", "V", "WMT");
    private static final List<String> CRYPTO_SYMBOLS = Arrays.asList("bitcoin", "ethereum", "binancecoin", "ripple",
            "cardano", "solana", "dogecoin",
            "polkadot", "avalanche-2", "matic-network");
    private static final List<String> CRYPTO_SYMBOL_MAPPING = Arrays.asList("BTC", "ETH", "BNB", "XRP", "ADA", "SOL",
            "DOGE",
            "DOT", "AVAX", "MATIC");

    @Autowired
    private InstrumentRepository instrumentRepository;

    @Value("${app.market.alphavantage.api-key}")
    private String apiKey;

    @Value("${app.market.rate-limit-ms}")
    private long rateLimitMs;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CloseableHttpClient httpClient = HttpClients.createDefault();

    // Track API call counts to handle rate limiting
    private AtomicInteger alphaVantageCallsInLastMinute = new AtomicInteger(0);
    private LocalDateTime lastResetTime = LocalDateTime.now();

    @Override
    public List<Instrument> getAllInstruments() {
        return instrumentRepository.findAll();
    }

    @Override
    public Optional<Instrument> getInstrumentBySymbol(String symbol) {
        return instrumentRepository.findBySymbol(symbol);
    }

    @Override
    @Scheduled(fixedRateString = "${app.market.refresh-interval-ms}", initialDelay = 1000)
    public void refreshMarketData() {
        logger.info("Starting market data refresh at {}", LocalDateTime.now());

        // Reset API call counter if a minute has passed
        if (LocalDateTime.now().isAfter(lastResetTime.plusMinutes(1))) {
            logger.info("Resetting API call counter. Previous count: {}", alphaVantageCallsInLastMinute.get());
            alphaVantageCallsInLastMinute.set(0);
            lastResetTime = LocalDateTime.now();
        }

        try {
            // Fetch stock data from Alpha Vantage
            logger.info("Fetching stock data for {} symbols", STOCK_SYMBOLS.size());
            int successfulStockFetches = 0;
            for (String symbol : STOCK_SYMBOLS) {
                try {
                    // Check if we're approaching API limit
                    if (alphaVantageCallsInLastMinute.get() >= 5) {
                        logger.warn("Alpha Vantage API call limit reached ({}). Pausing stock data fetching.",
                                alphaVantageCallsInLastMinute.get());
                        break;
                    }

                    boolean success = fetchStockData(symbol);
                    if (success) {
                        successfulStockFetches++;
                    }

                    // Rate limiting to avoid API restrictions
                    TimeUnit.MILLISECONDS.sleep(rateLimitMs);
                } catch (Exception e) {
                    logger.error("Error fetching data for stock {}: {}", symbol, e.getMessage());
                }
            }
            logger.info("Successfully fetched data for {}/{} stocks", successfulStockFetches, STOCK_SYMBOLS.size());

            // Fetch crypto data from CoinGecko
            logger.info("Fetching crypto data for {} symbols", CRYPTO_SYMBOLS.size());
            int successfulCryptoFetches = 0;
            for (int i = 0; i < CRYPTO_SYMBOLS.size(); i++) {
                try {
                    String coinGeckoId = CRYPTO_SYMBOLS.get(i);
                    String symbol = CRYPTO_SYMBOL_MAPPING.get(i);

                    boolean success = fetchCryptoDataFromCoinGecko(coinGeckoId, symbol);
                    if (success) {
                        successfulCryptoFetches++;
                    }

                    // Rate limiting for CoinGecko (more generous than Alpha Vantage)
                    TimeUnit.MILLISECONDS.sleep(1500);
                } catch (Exception e) {
                    logger.error("Error fetching data for crypto {}: {}", CRYPTO_SYMBOLS.get(i), e.getMessage());
                }
            }
            logger.info("Successfully fetched data for {}/{} cryptocurrencies", successfulCryptoFetches,
                    CRYPTO_SYMBOLS.size());

            logger.info("Market data refresh completed at {}", LocalDateTime.now());
        } catch (Exception e) {
            logger.error("Error during market data refresh: {}", e.getMessage());
        }
    }

    private boolean fetchStockData(String symbol) throws IOException, InterruptedException, ParseException {
        logger.debug("Fetching stock data for {}", symbol);
        String url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + symbol + "&apikey=" + apiKey;

        // Increment API call counter
        alphaVantageCallsInLastMinute.incrementAndGet();

        HttpGet request = new HttpGet(url);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            String jsonResponse = EntityUtils.toString(response.getEntity());
            JsonNode root = objectMapper.readTree(jsonResponse);

            // Check for API limit message
            if (root.has("Note") && root.get("Note").asText().contains("API call frequency")) {
                logger.warn("Alpha Vantage API limit reached: {}", root.get("Note").asText());
                return false;
            }

            if (root.has("Information") && root.get("Information").asText().contains("API call frequency")) {
                logger.warn("Alpha Vantage API limit reached: {}", root.get("Information").asText());
                return false;
            }

            if (root.has("Global Quote") && !root.get("Global Quote").isEmpty()
                    && root.get("Global Quote").size() > 0) {
                JsonNode quote = root.get("Global Quote");

                BigDecimal currentPrice = new BigDecimal(quote.get("05. price").asText());
                BigDecimal previousClose = new BigDecimal(quote.get("08. previous close").asText());
                BigDecimal dailyChange = currentPrice.subtract(previousClose)
                        .divide(previousClose, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

                BigDecimal dailyHigh = new BigDecimal(quote.get("03. high").asText());
                BigDecimal dailyLow = new BigDecimal(quote.get("04. low").asText());
                Long volume = Long.parseLong(quote.get("06. volume").asText());

                // Get or create instrument
                Instrument instrument = instrumentRepository.findBySymbol(symbol)
                        .orElse(Instrument.builder()
                                .symbol(symbol)
                                .name(getStockName(symbol))
                                .type(InstrumentType.STOCK)
                                .build());

                // Update instrument data
                instrument.setCurrentPrice(currentPrice);
                instrument.setDailyChange(dailyChange);
                instrument.setDailyHigh(dailyHigh);
                instrument.setDailyLow(dailyLow);
                instrument.setVolume(volume);
                instrument.setLastUpdated(LocalDateTime.now());

                // Get weekly change data
                fetchWeeklyChange(instrument);

                instrumentRepository.save(instrument);
                logger.info("Updated stock data for {}: price=${}, change={}%", symbol, currentPrice, dailyChange);
                return true;
            } else {
                logger.warn("No data found for stock: {}. Response: {}", symbol,
                        jsonResponse.length() > 100 ? jsonResponse.substring(0, 100) + "..." : jsonResponse);
                return false;
            }
        }
    }

    private boolean fetchCryptoDataFromCoinGecko(String coinId, String symbol)
            throws IOException, InterruptedException {
        logger.debug("Fetching crypto data for {} ({})", symbol, coinId);
        String url = "https://api.coingecko.com/api/v3/coins/" + coinId
                + "?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false";

        HttpGet request = new HttpGet(url);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            int statusCode = response.getCode();

            if (statusCode == 429) {
                logger.warn("CoinGecko API rate limit reached for {}", symbol);
                return false;
            }

            if (statusCode != 200) {
                logger.warn("CoinGecko API returned status code {} for {}", statusCode, symbol);
                return false;
            }

            String jsonResponse = EntityUtils.toString(response.getEntity());
            JsonNode root = objectMapper.readTree(jsonResponse);

            if (root.has("market_data")) {
                JsonNode marketData = root.get("market_data");

                BigDecimal currentPrice = new BigDecimal(marketData.get("current_price").get("usd").asText());
                BigDecimal dailyChange = new BigDecimal(marketData.get("price_change_percentage_24h").asText());
                BigDecimal weeklyChange = new BigDecimal(marketData.get("price_change_percentage_7d").asText());
                BigDecimal dailyHigh = new BigDecimal(marketData.get("high_24h").get("usd").asText());
                BigDecimal dailyLow = new BigDecimal(marketData.get("low_24h").get("usd").asText());
                Long volume = marketData.get("total_volume").get("usd").asLong();

                // Get or create instrument
                Instrument instrument = instrumentRepository.findBySymbol(symbol)
                        .orElse(Instrument.builder()
                                .symbol(symbol)
                                .name(getCryptoName(symbol))
                                .type(InstrumentType.CRYPTO)
                                .build());

                // Update instrument data
                instrument.setCurrentPrice(currentPrice);
                instrument.setDailyChange(dailyChange);
                instrument.setWeeklyChange(weeklyChange);
                instrument.setDailyHigh(dailyHigh);
                instrument.setDailyLow(dailyLow);
                instrument.setVolume(volume);
                instrument.setLastUpdated(LocalDateTime.now());

                instrumentRepository.save(instrument);
                logger.info("Updated crypto data for {}: price=${}, 24h change={}%, 7d change={}%",
                        symbol, currentPrice, dailyChange, weeklyChange);
                return true;
            } else {
                logger.warn("No market data found for crypto: {}. Response: {}", symbol,
                        jsonResponse.length() > 100 ? jsonResponse.substring(0, 100) + "..." : jsonResponse);
                return false;
            }
        } catch (Exception e) {
            logger.error("Error fetching CoinGecko data for {} ({}): {}", symbol, coinId, e.getMessage());
            return false;
        }
    }

    private void fetchWeeklyChange(Instrument instrument) throws IOException, InterruptedException, ParseException {
        logger.debug("Fetching weekly change for {}", instrument.getSymbol());
        String url = "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=" + instrument.getSymbol()
                + "&apikey=" + apiKey;

        // Increment API call counter
        alphaVantageCallsInLastMinute.incrementAndGet();

        HttpGet request = new HttpGet(url);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            String jsonResponse = EntityUtils.toString(response.getEntity());
            JsonNode root = objectMapper.readTree(jsonResponse);

            // Check for API limit message
            if (root.has("Note") && root.get("Note").asText().contains("API call frequency")) {
                logger.warn("Alpha Vantage API limit reached: {}", root.get("Note").asText());
                return;
            }

            if (root.has("Information") && root.get("Information").asText().contains("API call frequency")) {
                logger.warn("Alpha Vantage API limit reached: {}", root.get("Information").asText());
                return;
            }

            if (root.has("Weekly Time Series") && !root.get("Weekly Time Series").isEmpty()) {
                JsonNode timeSeries = root.get("Weekly Time Series");
                if (timeSeries.isEmpty()) {
                    logger.warn("Weekly Time Series is empty for {}", instrument.getSymbol());
                    return;
                }

                // Get the two most recent weeks (keys are dates)
                String[] weeks = new String[2];
                int i = 0;

                // Safely iterate through the time series to get the date keys
                for (JsonNode week : timeSeries) {
                    if (i >= 2)
                        break;
                    weeks[i++] = week.asText();
                }

                // An alternative approach if the above doesn't work
                if (weeks[0] == null || weeks[1] == null) {
                    i = 0;
                    Iterator<String> fieldNames = timeSeries.fieldNames();
                    while (fieldNames.hasNext() && i < 2) {
                        weeks[i++] = fieldNames.next();
                    }
                }

                if (weeks[0] != null && weeks[1] != null) {
                    try {
                        JsonNode currentWeekNode = timeSeries.get(weeks[0]);
                        JsonNode previousWeekNode = timeSeries.get(weeks[1]);

                        if (currentWeekNode != null && previousWeekNode != null &&
                                currentWeekNode.has("4. close") && previousWeekNode.has("4. close")) {

                            BigDecimal currentWeekClose = new BigDecimal(currentWeekNode.get("4. close").asText());
                            BigDecimal previousWeekClose = new BigDecimal(previousWeekNode.get("4. close").asText());

                            BigDecimal weeklyChange = currentWeekClose.subtract(previousWeekClose)
                                    .divide(previousWeekClose, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100));

                            instrument.setWeeklyChange(weeklyChange);
                            logger.debug("Updated weekly change for {}: {}%", instrument.getSymbol(), weeklyChange);
                        } else {
                            logger.warn("Missing close data for {} in weekly time series", instrument.getSymbol());
                        }
                    } catch (Exception e) {
                        logger.error("Error processing weekly data for {}: {}", instrument.getSymbol(), e.getMessage());
                    }
                } else {
                    logger.warn("Insufficient weekly data points for {}", instrument.getSymbol());
                }
            } else {
                logger.warn("No weekly data found for {}", instrument.getSymbol());
            }
        } catch (Exception e) {
            logger.error("Error fetching weekly data for {}: {}", instrument.getSymbol(), e.getMessage());
        }
    }

    private void fetchCryptoData(String symbol) throws IOException, InterruptedException, ParseException {
        logger.debug("Attempting to fetch crypto data from Alpha Vantage for {}", symbol);
        String url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=" + symbol
                + "&to_currency=USD&apikey=" + apiKey;

        // Increment API call counter
        alphaVantageCallsInLastMinute.incrementAndGet();

        HttpGet request = new HttpGet(url);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            String jsonResponse = EntityUtils.toString(response.getEntity());
            JsonNode root = objectMapper.readTree(jsonResponse);

            // Check for API limit message
            if (root.has("Note") && root.get("Note").asText().contains("API call frequency")) {
                logger.warn("Alpha Vantage API limit reached: {}", root.get("Note").asText());
                return;
            }

            if (root.has("Information") && root.get("Information").asText().contains("API call frequency")) {
                logger.warn("Alpha Vantage API limit reached: {}", root.get("Information").asText());
                return;
            }

            if (root.has("Realtime Currency Exchange Rate") && !root.get("Realtime Currency Exchange Rate").isEmpty()) {
                JsonNode exchangeRate = root.get("Realtime Currency Exchange Rate");

                BigDecimal currentPrice = new BigDecimal(exchangeRate.get("5. Exchange Rate").asText());

                // Get or create instrument
                Instrument instrument = instrumentRepository.findBySymbol(symbol)
                        .orElse(Instrument.builder()
                                .symbol(symbol)
                                .name(getCryptoName(symbol))
                                .type(InstrumentType.CRYPTO)
                                .build());

                // For crypto, we need to fetch daily data to get change percentages
                fetchCryptoDailyData(instrument);

                // Update instrument data
                instrument.setCurrentPrice(currentPrice);
                instrument.setLastUpdated(LocalDateTime.now());

                instrumentRepository.save(instrument);
                logger.info("Updated crypto data from Alpha Vantage for {}: price=${}", symbol, currentPrice);
            } else {
                logger.warn("No data found for crypto from Alpha Vantage: {}. Response: {}", symbol,
                        jsonResponse.length() > 100 ? jsonResponse.substring(0, 100) + "..." : jsonResponse);

                // Try CoinGecko as fallback
                int index = CRYPTO_SYMBOL_MAPPING.indexOf(symbol);
                if (index >= 0) {
                    String coinGeckoId = CRYPTO_SYMBOLS.get(index);
                    logger.info("Attempting to fetch {} from CoinGecko using ID: {}", symbol, coinGeckoId);
                    fetchCryptoDataFromCoinGecko(coinGeckoId, symbol);
                }
            }
        }
    }

    private void fetchCryptoDailyData(Instrument instrument) throws IOException, InterruptedException, ParseException {
        logger.debug("Fetching daily crypto data for {}", instrument.getSymbol());
        String url = "https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol="
                + instrument.getSymbol() + "&market=USD&apikey=" + apiKey;

        // Increment API call counter
        alphaVantageCallsInLastMinute.incrementAndGet();

        HttpGet request = new HttpGet(url);
        try (CloseableHttpResponse response = httpClient.execute(request)) {
            String jsonResponse = EntityUtils.toString(response.getEntity());
            JsonNode root = objectMapper.readTree(jsonResponse);

            // Check for API limit message
            if (root.has("Note") && root.get("Note").asText().contains("API call frequency")) {
                logger.warn("Alpha Vantage API limit reached: {}", root.get("Note").asText());
                return;
            }

            if (root.has("Information") && root.get("Information").asText().contains("API call frequency")) {
                logger.warn("Alpha Vantage API limit reached: {}", root.get("Information").asText());
                return;
            }

            if (root.has("Time Series (Digital Currency Daily)")) {
                JsonNode timeSeries = root.get("Time Series (Digital Currency Daily)");

                // Get the most recent days
                String[] days = new String[8]; // 1 week + today
                int i = 0;
                for (JsonNode node : timeSeries) {
                    if (i < days.length) {
                        days[i++] = node.asText();
                    } else {
                        break;
                    }
                }

                if (days[0] != null && days[1] != null) {
                    // Daily change
                    BigDecimal todayClose = new BigDecimal(timeSeries.get(days[0]).get("4a. close (USD)").asText());
                    BigDecimal yesterdayClose = new BigDecimal(timeSeries.get(days[1]).get("4a. close (USD)").asText());

                    BigDecimal dailyChange = todayClose.subtract(yesterdayClose)
                            .divide(yesterdayClose, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100));

                    instrument.setDailyChange(dailyChange);

                    // Daily high/low
                    BigDecimal dailyHigh = new BigDecimal(timeSeries.get(days[0]).get("2a. high (USD)").asText());
                    BigDecimal dailyLow = new BigDecimal(timeSeries.get(days[0]).get("3a. low (USD)").asText());
                    Long volume = new BigDecimal(timeSeries.get(days[0]).get("5. volume").asText()).longValue();

                    instrument.setDailyHigh(dailyHigh);
                    instrument.setDailyLow(dailyLow);
                    instrument.setVolume(volume);

                    // Weekly change
                    if (days[7] != null) {
                        BigDecimal weekAgoClose = new BigDecimal(
                                timeSeries.get(days[7]).get("4a. close (USD)").asText());

                        BigDecimal weeklyChange = todayClose.subtract(weekAgoClose)
                                .divide(weekAgoClose, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100));

                        instrument.setWeeklyChange(weeklyChange);
                    }

                    logger.debug("Updated daily crypto data for {}: daily change={}%, weekly change={}%",
                            instrument.getSymbol(), dailyChange, instrument.getWeeklyChange());
                }
            } else {
                logger.warn("No daily data found for crypto: {}", instrument.getSymbol());
            }
        } catch (Exception e) {
            logger.error("Error fetching daily data for crypto {}: {}", instrument.getSymbol(), e.getMessage());
        }
    }

    private String getStockName(String symbol) {
        switch (symbol) {
            case "AAPL":
                return "Apple Inc.";
            case "MSFT":
                return "Microsoft Corporation";
            case "GOOGL":
                return "Alphabet Inc.";
            case "AMZN":
                return "Amazon.com, Inc.";
            case "TSLA":
                return "Tesla, Inc.";
            case "META":
                return "Meta Platforms, Inc.";
            case "NVDA":
                return "NVIDIA Corporation";
            case "JPM":
                return "JPMorgan Chase & Co.";
            case "V":
                return "Visa Inc.";
            case "WMT":
                return "Walmart Inc.";
            default:
                return symbol;
        }
    }

    private String getCryptoName(String symbol) {
        switch (symbol) {
            case "BTC":
                return "Bitcoin";
            case "ETH":
                return "Ethereum";
            case "BNB":
                return "Binance Coin";
            case "XRP":
                return "XRP";
            case "ADA":
                return "Cardano";
            case "SOL":
                return "Solana";
            case "DOGE":
                return "Dogecoin";
            case "DOT":
                return "Polkadot";
            case "AVAX":
                return "Avalanche";
            case "MATIC":
                return "Polygon";
            default:
                return symbol;
        }
    }
}