/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const ORS_API_KEY = process.env.ORS_API_KEY!;
const ORIGIN_COORDS = [-64.34992, -33.13067]; // Calle Lamadrid

function haversineDistance([lon1, lat1]: number[], [lon2, lat2]: number[]) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { destination, coords, orderTotal } = body;

  // ⚠️ Si total >= 15000 y ya recibimos coords, solo devolvemos coords
  if (orderTotal >= 15000) {
    if (coords) {
      return NextResponse.json({
        destinationCoords: coords,
        shippingCost: null,
      });
    }

    // hacemos geocoding SOLO para obtener coords

    const geocodeRes = await fetch(
      `https://api.openrouteservice.org/geocode/search?` +
        `api_key=${ORS_API_KEY}` +
        `&text=${encodeURIComponent(destination)}` +
        `&focus.point.lon=${ORIGIN_COORDS[0]}` +
        `&focus.point.lat=${ORIGIN_COORDS[1]}` +
        `&boundary.circle.lon=${ORIGIN_COORDS[0]}` +
        `&boundary.circle.lat=${ORIGIN_COORDS[1]}` +
        `&boundary.circle.radius=30000` // 30 km
    );

    const geocodeData = await geocodeRes.json();
    const destFeature = geocodeData.features?.[0];

    if (!destFeature) {
      return NextResponse.json(
        { error: "No se encontró la dirección destino" },
        { status: 400 }
      );
    }

    const destCoords = destFeature.geometry.coordinates;

    return NextResponse.json({
      destinationCoords: destCoords,
      shippingCost: null,
    });
  }

  let destCoords: [number, number] | undefined;

  try {
    if (coords && coords.length === 2) {
      // Usar coords directamente
      destCoords = coords;
    } else if (destination) {
      // Hacer geocoding

      const geocodeRes = await fetch(
        `https://api.openrouteservice.org/geocode/search?` +
          `api_key=${ORS_API_KEY}` +
          `&text=${encodeURIComponent(destination)}` +
          `&focus.point.lon=${ORIGIN_COORDS[0]}` +
          `&focus.point.lat=${ORIGIN_COORDS[1]}` +
          `&boundary.circle.lon=${ORIGIN_COORDS[0]}` +
          `&boundary.circle.lat=${ORIGIN_COORDS[1]}` +
          `&boundary.circle.radius=30000` // 30 km
      );
      const geocodeData = await geocodeRes.json();
      console.log(
        "🚀 [DEBUG] Geocode response:",
        JSON.stringify(geocodeData, null, 2)
      );
      const destFeature = geocodeData.features?.[0];
      if (!destFeature) {
        return NextResponse.json(
          { error: "No se encontró la dirección destino" },
          { status: 400 }
        );
      }
      destCoords = destFeature.geometry.coordinates;
    } else {
      return NextResponse.json(
        { error: "Debes enviar 'destination' o 'coords'" },
        { status: 400 }
      );
    }

    console.log("📍 [DEBUG] Destination coordinates:", destCoords);

    if (!destCoords) {
      return NextResponse.json(
        { error: "No se encontraron coordenadas destino" },
        { status: 400 }
      );
    }

    // Routing con OSRM
    const routingRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${ORIGIN_COORDS.join(
        ","
      )};${destCoords.join(",")}?overview=false`
    );
    const routingData = await routingRes.json();

    const distanceLineal = haversineDistance(ORIGIN_COORDS, destCoords);
    console.log("🚀 [DEBUG] distanceLineal:", distanceLineal);

    const distanceRuta = routingData.routes?.[0]?.distance;
    console.log("🚀 [DEBUG] distanceRuta:", distanceRuta);

    if (!distanceRuta) {
      throw new Error("No se pudo calcular la ruta.");
    }

    const distanceMetersPromedio = (distanceLineal + distanceRuta) / 2;
    console.log("🚀 [DEBUG] distanceMetersPromedio:", distanceMetersPromedio);

    const distanceMeters = distanceRuta;

    // Redondea
    // const blocks = Math.floor(distanceMeters / 100);

    const blocks = Math.ceil(distanceMeters / 100);

    const priceTable = [
      { maxBlocks: 5, price: 1800 },
      { maxBlocks: 10, price: 2000 },
      { maxBlocks: 15, price: 2500 },
      { maxBlocks: 20, price: 2800 },
      { maxBlocks: 25, price: 3000 },
      { maxBlocks: 30, price: 3200 },
      { maxBlocks: 35, price: 3500 },
      { maxBlocks: 40, price: 3800 },
      { maxBlocks: 45, price: 4000 },
      { maxBlocks: 50, price: 4300 },
      { maxBlocks: 55, price: 4600 },
      { maxBlocks: 60, price: 4900 },
    ];

    let shippingCost = 5500;
    for (const row of priceTable) {
      if (blocks <= row.maxBlocks) {
        shippingCost = row.price;
        break;
      }
    }

    console.log("📏 [DEBUG] Distancia metros:", distanceMeters);
    console.log("📏 [DEBUG] Bloques:", blocks);
    console.log("💰 [DEBUG] Shipping cost:", shippingCost);

    return NextResponse.json({
      distanceMeters,
      blocks,
      shippingCost,
      destinationCoords: destCoords,
    });
  } catch (err: any) {
    console.error("❌ Error calculando envío", err);
    return NextResponse.json(
      { error: "Error interno calculando costo de envío" },
      { status: 500 }
    );
  }
}
