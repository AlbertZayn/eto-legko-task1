# Internet speed test

Консольные скрипты (Python и Node.js): **10 последовательных** HTTP-запросов к URL, полное чтение каждого ответа; на выходе — среднее время, суммарный объём и скорость скачивания.

## Единицы измерения

| Метрика | Единица | Пояснение |
| --- | --- | --- |
| Среднее время запроса | **s** (секунды) | среднее арифметическое длительности 10 запросов |
| Общий объём данных | **MB** (мегабайты) | 1 MB = 1 000 000 байт (SI) |
| Скорость скачивания | **Mbps** (мегабиты в секунду) | `(сумма_байт × 8) / (суммарное_время_с × 1 000 000)` |

Скорость считается по **суммарному** объёму и **суммарному** времени всех 10 запросов.

## Требования

**Python** 3.8+ · **Node.js** 18+ (встроенный `fetch`) · без внешних зависимостей.

## Запуск

Пример с публичным файлом Wikimedia (стабильнее httpbin; некоторые хосты могут ограничивать частоту запросов):

```bash
python3 speed_test.py "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg"
node speed_test.js "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg"
```

## Пример вывода

```
URL: https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg
Requests: 10 (sequential)

Request 1/10: 0.842 s, 5582617 bytes
Request 2/10: 0.791 s, 5582617 bytes
...
Request 10/10: 0.805 s, 5582617 bytes

Average request time: 0.812 s
Total downloaded:     55.826 MB
Download speed:       54.97 Mbps
```
