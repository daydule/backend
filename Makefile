# make [command]

# 
# コンテナ起動
# 
up:
	docker-compose up
# デタッチモードオプション
detach:
	docker-compose up -d

# 
# コンテナ停止・削除
# 
down:
	docker-compose down
# ボリューム削除オプション
destroy:
	docker-compose down --volumes
# ローカルイメージ削除オプション
rmi:
	docker-compose down --rmi local

######################
# git subtree設定
######################
subtree_set:
	git remote add PR-Template https://github.com/daydule/PR-Template.git
subtree_pull:
	git subtree add --prefix=.github/PULL_REQUEST_TEMPLATE PR-Template main