import React from "react";
import { FoldingCube } from "better-react-spinkit";

export default function PreviewLoader({ error }) {
  return (
    <>
      <div
        id="preview-loader"
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "black",
          flexDirection: "column",
          zIndex: 9999
        }}
      >
        {!error ? (
          <>
            <FoldingCube size={200} color="white" />
            <p
              style={{
                color: "white",
                marginTop: "50px",
                letterSpacing: "1.5px",
                fontFamily: "georgia",
                fontSize: "35px"
              }}
            >
              loading
            </p>
          </>
        ) : (
          <div style={{ color: "white", maxWidth: "90%" }}>
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  ::selection {
                    color: black;
                    background: yellow;
                  }
              `
              }}
            />
            <h1 dangerouslySetInnerHTML={{ __html: error.title }} />
            <p dangerouslySetInnerHTML={{ __html: error.message }} />
            {error.error ? (
              <pre>
                {error.error.title ? <h1>{error.title}</h1> : null}
                {error.error.data && error.error.data.status ? (
                  <h4>Error: {error.error.data.status}</h4>
                ) : null}
                {error.code ? <h3>Code: "{error.error.code}"</h3> : null}
                {error.error.message ? (
                  <>
                    <h5>
                      Message: "
                      <span
                        dangerouslySetInnerHTML={{
                          __html: error.error.message
                        }}
                      />
                      "
                    </h5>
                  </>
                ) : null}
              </pre>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
