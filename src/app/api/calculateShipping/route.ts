/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const ORS_API_KEY = process.env.ORS_API_KEY!;
const ORIGIN_COORDS: [number, number] = [-64.34992, -33.13067]; // Calle Lamadrid

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

async function geocodeDestination(
  destination: string,
): Promise<[number, number]> {
  const geocodeRes = await fetch(
    `https://api.openrouteservice.org/geocode/search?` +
      `api_key=${ORS_API_KEY}` +
      `&text=${encodeURIComponent(destination)}` +
      `&focus.point.lon=${ORIGIN_COORDS[0]}` +
      `&focus.point.lat=${ORIGIN_COORDS[1]}` +
      `&boundary.circle.lon=${ORIGIN_COORDS[0]}` +
      `&boundary.circle.lat=${ORIGIN_COORDS[1]}` +
      `&boundary.circle.radius=30000`,
  );

  const geocodeData = await geocodeRes.json();
  const destFeature = geocodeData.features?.[0];

  if (!destFeature) {
    throw new Error("No se encontró la dirección destino");
  }

  return destFeature.geometry.coordinates as [number, number];
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { destination, coords } = body as {
    destination?: string;
    coords?: [number, number];
  };

  try {
    let destCoords: [number, number];

    // 1) coords directas (map drag)
    if (coords && coords.length === 2) {
      destCoords = coords;
    }
    // 2) destination string (input address)
    else if (destination && destination.trim() !== "") {
      destCoords = await geocodeDestination(destination);
    }
    // 3) nada válido
    else {
      return NextResponse.json(
        { error: "Debes enviar 'destination' o 'coords'" },
        { status: 400 },
      );
    }

    // Routing con OSRM
    const routingRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${ORIGIN_COORDS.join(
        ",",
      )};${destCoords.join(",")}?overview=false`,
    );
    const routingData = await routingRes.json();

    const distanceRuta = routingData.routes?.[0]?.distance;
    if (!distanceRuta) {
      throw new Error("No se pudo calcular la ruta.");
    }

    // Si querés mantener el debug:
    const distanceLineal = haversineDistance(ORIGIN_COORDS, destCoords);
    console.log("🚀 [DEBUG] distanceLineal:", distanceLineal);
    console.log("🚀 [DEBUG] distanceRuta:", distanceRuta);

    const distanceMeters = distanceRuta;
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

    return NextResponse.json({
      distanceMeters,
      blocks,
      shippingCost, // ✅ siempre número
      destinationCoords: destCoords,
    });
  } catch (err: any) {
    console.error("❌ Error calculando envío", err);

    // Si el error viene del geocode, devolvemos 400 (mejor UX)
    const msg = err?.message || "Error interno calculando costo de envío";
    const isGeocode = msg.includes("dirección destino");

    return NextResponse.json({ error: msg }, { status: isGeocode ? 400 : 500 });
  }
}
