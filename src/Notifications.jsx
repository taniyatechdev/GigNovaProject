import React, { useState } from "react";
import { useGigNova } from "./context/GigNovaContext";
import "./Notifications.css";

export default function Notifications({ setPage }) {
  const { user, notifications = [], unreadCount = 0,
    readNotificationIds = [], markNotificationRead,
    markAllNotificationsRead } = useGigNova();
  const [filter, setFilter] = useState("all");
  const visible = notifications.filter((item) =>
    filter === "all" || !readNotificationIds.includes(item.id));
  const openItem = (item) => {
    markNotificationRead(item.id);
    if (typeof setPage === "function" && item.link) setPage(item.link);
  };
  if (!user) return <main className="gn-notifications"><p>Please sign in to view notifications.</p></main>;
  return (
    <main className="gn-notifications">
      <div className="gn-notifications-heading">
        <div><p className="gn-notifications-eyebrow">GIGNOVA UPDATES</p>
          <h1>🔔 Notifications</h1><p>{unreadCount} unread update{unreadCount === 1 ? "" : "s"}</p></div>
        <button type="button" disabled={!unreadCount} onClick={markAllNotificationsRead}>Mark all as read</button>
      </div>
      <div className="gn-notifications-tabs" role="group" aria-label="Filter notifications">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All ({notifications.length})</button>
        <button type="button" className={filter === "unread" ? "active" : ""} onClick={() => setFilter("unread")}>Unread ({unreadCount})</button>
      </div>
      {visible.length === 0 ? <div className="gn-notifications-empty">No {filter === "unread" ? "unread " : ""}notifications yet.</div> :
        <div className="gn-notifications-list">{visible.map((item) => {
          const unread = !readNotificationIds.includes(item.id);
          return <article key={item.id} className={`gn-notification ${unread ? "unread" : ""}`}>
            <div className="gn-notification-icon" aria-hidden="true">{item.type.includes("payment") || item.type === "payout" ? "💰" : item.type.includes("proposal") ? "📩" : item.type.includes("invitation") ? "💌" : "📋"}</div>
            <div className="gn-notification-content"><h2>{item.title} {unread && <span className="gn-notification-dot" aria-label="Unread" />}</h2>
              <p>{item.description}</p><small>{item.createdAt && !Number.isNaN(Date.parse(item.createdAt)) ? new Date(item.createdAt).toLocaleString("en-IN") : "Date unavailable"}</small></div>
            <div className="gn-notification-actions"><button type="button" onClick={() => openItem(item)}>View</button>
              {unread && <button type="button" className="secondary" onClick={() => markNotificationRead(item.id)}>Mark read</button>}</div>
          </article>;
        })}</div>}
      <p className="gn-notifications-note">Demo notifications are generated from data stored in this browser. They are not real-time alerts across devices.</p>
    </main>
  );
}
