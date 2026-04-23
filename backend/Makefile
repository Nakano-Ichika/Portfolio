.PHONY: update backtest wf all push deploy

update:
	python fundamentals.py

backtest:
	python backtest.py

wf:
	python backtest_wf.py

all: update backtest wf
	@echo "All data regenerated."

push:
	git add screener_result.csv backtest_result.csv benchmark_result.csv portfolio.csv wf_backtest_result.csv
	git commit -m "data: regenerate $$(date +%Y-%m-%d)"
	git push origin main

deploy: all push
	@echo "Deployed to Render."
