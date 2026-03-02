"use client";

/**
 * Amazon L9 Grade Analytics Utility
 * Comprehensive tracking for E-commerce, Performance, and Errors.
 */

export type GA4Item = {
    item_id: string;
    item_name: string;
    affiliation?: string;
    coupon?: string;
    discount?: number;
    index?: number;
    item_brand?: string;
    item_category?: string;
    item_category2?: string;
    item_category3?: string;
    item_category4?: string;
    item_category5?: string;
    item_list_id?: string;
    item_list_name?: string;
    item_variant?: string;
    location_id?: string;
    price?: number;
    quantity?: number;
};

type GTMEvent = {
    event: string;
    ecommerce?: {
        currency?: string;
        value?: number;
        transaction_id?: string;
        coupon?: string;
        shipping?: number;
        tax?: number;
        shipping_tier?: string;
        payment_type?: string;
        items?: GA4Item[];
        item_list_id?: string;
        item_list_name?: string;
    };
    [key: string]: any;
};

// Extend Window interface to include dataLayer
declare global {
    interface Window {
        dataLayer: GTMEvent[];
    }
}

/**
 * Core event dispatcher
 */
export const sendGTMEvent = (data: GTMEvent) => {
    if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            ...data,
            // Clear ecommerce object before next push to avoid state leakage in GA4
            // This is a GTM best practice for e-commerce
        });
    }
};

/**
 * Deep Funnel E-commerce Analytics
 */
export const analytics = {
    // 1. Discovery
    viewItemList: (items: GA4Item[], listId?: string, listName?: string) => {
        sendGTMEvent({
            event: "view_item_list",
            ecommerce: {
                item_list_id: listId,
                item_list_name: listName,
                items,
            },
        });
    },

    selectItem: (item: GA4Item, listId?: string, listName?: string) => {
        sendGTMEvent({
            event: "select_item",
            ecommerce: {
                item_list_id: listId,
                item_list_name: listName,
                items: [item],
            },
        });
    },

    viewItem: (item: GA4Item) => {
        sendGTMEvent({
            event: "view_item",
            ecommerce: {
                currency: "BDT",
                value: item.price,
                items: [item],
            },
        });
    },

    // 2. Consideration
    addToCart: (item: GA4Item) => {
        sendGTMEvent({
            event: "add_to_cart",
            ecommerce: {
                currency: "BDT",
                value: (item.price || 0) * (item.quantity || 1),
                items: [item],
            },
        });
    },

    removeFromCart: (item: GA4Item) => {
        sendGTMEvent({
            event: "remove_from_cart",
            ecommerce: {
                currency: "BDT",
                value: (item.price || 0) * (item.quantity || 1),
                items: [item],
            },
        });
    },

    viewCart: (items: GA4Item[], total: number) => {
        sendGTMEvent({
            event: "view_cart",
            ecommerce: {
                currency: "BDT",
                value: total,
                items,
            },
        });
    },

    // 3. Purchase Path
    beginCheckout: (items: GA4Item[], total: number) => {
        sendGTMEvent({
            event: "begin_checkout",
            ecommerce: {
                currency: "BDT",
                value: total,
                items,
            },
        });
    },

    addShippingInfo: (items: GA4Item[], total: number, shippingTier: string) => {
        sendGTMEvent({
            event: "add_shipping_info",
            ecommerce: {
                currency: "BDT",
                value: total,
                shipping_tier: shippingTier,
                items,
            },
        });
    },

    addPaymentInfo: (items: GA4Item[], total: number, paymentType: string) => {
        sendGTMEvent({
            event: "add_payment_info",
            ecommerce: {
                currency: "BDT",
                value: total,
                payment_type: paymentType,
                items,
            },
        });
    },

    purchase: (params: {
        transaction_id: string;
        value: number;
        items: GA4Item[];
        shipping?: number;
        tax?: number;
        coupon?: string;
    }) => {
        sendGTMEvent({
            event: "purchase",
            ecommerce: {
                transaction_id: params.transaction_id,
                value: params.value,
                currency: "BDT",
                shipping: params.shipping || 0,
                tax: params.tax || 0,
                coupon: params.coupon,
                items: params.items,
            },
        });
    },

    // 4. Technical Observability
    trackException: (description: string, fatal: boolean = false) => {
        sendGTMEvent({
            event: "exception",
            description,
            fatal,
        });
    },

    trackPerformance: (name: string, value: number, category: string = "WebVitals") => {
        sendGTMEvent({
            event: "performance_timing",
            timing_name: name,
            timing_value: Math.round(value),
            timing_category: category,
        });
    },
};
