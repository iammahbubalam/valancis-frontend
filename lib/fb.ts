"use client";

/**
 * Meta (Facebook) Tracking Engine
 * Handles browser-side Pixel events and deduplication.
 */

export const getFacebookCookies = () => {
    if (typeof document === "undefined") return { fbp: null, fbc: null };
    
    const cookies = document.cookie.split(";").reduce((acc: any, cookie) => {
        const [name, value] = cookie.split("=").map((c) => c.trim());
        if (name === "_fbp" || name === "_fbc") {
            acc[name.replace("_", "")] = value;
        }
        return acc;
    }, {});

    return {
        fbp: cookies.fbp || null,
        fbc: cookies.fbc || null,
    };
};

export const fbTrack = (eventName: string, params: Record<string, any> = {}, eventId?: string) => {
    if (typeof window !== "undefined" && (window as any).fbq) {
        if (eventId) {
            (window as any).fbq("track", eventName, params, { eventID: eventId });
        } else {
            (window as any).fbq("track", eventName, params);
        }
        
        if (process.env.NODE_ENV === "development") {
            console.log(`[Meta Pixel] Event: ${eventName}`, params, eventId ? `(EventID: ${eventId})` : "");
        }
    }
};

export const fbEvents = {
    viewContent: (product: any, eventId?: string) => {
        fbTrack("ViewContent", {
            content_ids: [product.id],
            content_name: product.name,
            content_type: "product",
            value: product.salePrice || product.basePrice,
            currency: "BDT",
        }, eventId);
    },

    addToCart: (product: any, variantName?: string, eventId?: string) => {
        fbTrack("AddToCart", {
            content_ids: [product.id],
            content_name: product.name,
            content_type: "product",
            content_category: product.categories?.[0]?.name,
            value: product.salePrice || product.basePrice,
            currency: "BDT",
            content_variant: variantName,
        }, eventId);
    },

    initiateCheckout: (items: any[], total: number, eventId?: string) => {
        fbTrack("InitiateCheckout", {
            content_ids: items.map(i => i.id),
            contents: items.map(i => ({ id: i.id, quantity: i.quantity })),
            num_items: items.length,
            value: total,
            currency: "BDT",
            content_type: "product",
        }, eventId);
    },

    search: (searchString: string) => {
        fbTrack("Search", {
            search_string: searchString,
        });
    },

    contact: () => {
        fbTrack("Contact");
    },

    completeRegistration: () => {
        fbTrack("CompleteRegistration");
    }
};
