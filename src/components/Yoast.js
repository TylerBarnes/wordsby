import React from "react";
import { Helmet } from "react-helmet";

export default props => <Yoast {...props} />;

const Yoast = ({ yoast, wpUrl, buildUrl, pagePath }) => {
  if (!yoast || !wpUrl || !buildUrl || !pagePath) return null;

  let {
    canonical_url,
    og_description,
    og_image,
    og_title,
    seo_metadesc,
    seo_title,
    siteName
  } = yoast;

  buildUrl = buildUrl ? buildUrl.replace(/\/$/, "") : buildUrl;

  let currentUrl = buildUrl + pagePath;

  // if there is no canonical URL in yoast, it should be set to the current url
  if (!canonical_url) canonical_url = currentUrl;

  // replace the WP url with gatsby url if necessary
  if (!!canonical_url && canonical_url.includes(wpUrl))
    canonical_url = canonical_url.replace(wpUrl, buildUrl);

  // still need:
  // og:locale
  // fb:app_id

  return (
    <Helmet>
      {/* SEO title */}
      {!!seo_title && seo_title !== "" && <title>{seo_title}</title>}

      {/* SEO meta description */}
      {!!seo_metadesc && seo_metadesc !== "" && (
        <meta name="description" content={seo_metadesc} />
      )}

      {/* Canonical url */}
      {!!canonical_url && canonical_url !== "" && (
        <link rel="canonical" href={canonical_url} />
      )}

      {/* OG Site type */}
      <meta property="og:type" content="website" />
      {!!og_description && og_description !== "" && (
        <meta
          property="og:description"
          content={og_description ? og_description : seo_metadesc}
        />
      )}

      {/* OG image */}
      {!!og_image &&
        !!og_image.publicURL &&
        !!buildUrl &&
        typeof buildUrl === "string" &&
        typeof og_image.publicUrl === "string" && (
          <meta property="og:image" content={buildUrl + og_image.publicURL} />
        )}

      {/* OG site name */}
      {!!siteName && <meta property="og:site_name" content={siteName} />}

      {/* OG url */}
      {!!currentUrl && <meta property="og:url" content={currentUrl} />}

      {/* OG title (same as SEO title) */}
      {!!og_title && og_title !== "" && (
        <meta
          property="og:title"
          content={og_title ? og_title : seo_title || null}
        />
      )}

      {/* twitter */}
      <meta name="twitter:card" content="summary" />

      {/* Twitter image = OG image */}
      {!!og_image && !!og_image.publicURL && !!buildUrl && (
        <meta
          property="twitter:image"
          content={buildUrl + og_image.publicURL}
        />
      )}

      {/* Twitter title = og title or seo title */}
      {!!og_title && og_title !== "" && (
        <meta
          property="twitter:title"
          content={og_title ? og_title : seo_title}
        />
      )}
    </Helmet>
  );
};
