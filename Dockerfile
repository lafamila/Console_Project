FROM python:3.12.7-slim as builder

RUN mkdir /project
COPY /. /project
WORKDIR /project

RUN apt-get update \
      && apt-get install -y --no-install-recommends gcc libc-dev \
      && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip \
      && pip install --user -r requirements.txt

RUN apt-get purge -y --auto-remove gcc libc-dev

FROM python:3.12.7-slim

COPY --from=builder /project /project
COPY --from=builder /root/.local /root/.local

WORKDIR /project

ENV PATH=/root/.local:$PATH

CMD ["python", "./__main__.py"]