FROM rust:1.93-slim-bookworm AS builder

WORKDIR /build
COPY Cargo.toml Cargo.lock ./
RUN mkdir src \
    && echo 'fn main() {}' > src/main.rs \
    && touch src/lib.rs \
    && cargo build --release --locked \
    && rm -rf src

COPY src ./src
RUN touch src/main.rs src/lib.rs && cargo build --release --locked

FROM debian:bookworm-slim AS runtime

RUN useradd --system --uid 10001 --user-group worker \
    && mkdir -p /data/contracts \
    && chown -R worker:worker /data

COPY --from=builder /build/target/release/worker /usr/local/bin/worker

USER worker

ENTRYPOINT ["/usr/local/bin/worker"]
