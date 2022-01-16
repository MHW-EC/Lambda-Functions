FROM public.ecr.aws/lambda/nodejs:14

COPY . ${LAMBDA_TASK_ROOT}/

RUN npm install --target ${LAMBDA_TASK_ROOT}


# RUN yum install -y git

# RUN npm install -g npm@latest


# COPY --from=0 ./app ./node_modules/shippify-server