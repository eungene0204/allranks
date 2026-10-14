import au from "./au.mts";
import br from "./br.mts";
import ca from "./ca.mts";
import cn from "./cn.mts";
import de from "./de.mts";
import es from "./es.mts";
import fr from "./fr.mts";
import gb from "./gb.mts";
import india from "./in.mts";
import it from "./it.mts";
import jp from "./jp.mts";
import kr from "./kr.mts";
import mx from "./mx.mts";
import ru from "./ru.mts";
import ch from "./ch.mts";
import id from "./id.mts";
import nl from "./nl.mts";
import pl from "./pl.mts";
import se from "./se.mts";
import tr from "./tr.mts";
import ar from "./ar.mts";
import my from "./my.mts";
import sa from "./sa.mts";
import th from "./th.mts";
import za from "./za.mts";
import at from "./at.mts";
import be from "./be.mts";
import eg from "./eg.mts";
import fi from "./fi.mts";
import gr from "./gr.mts";
import no from "./no.mts";
import nz from "./nz.mts";
import pk from "./pk.mts";
import ua from "./ua.mts";
import cl from "./cl.mts";
import co from "./co.mts";
import cr from "./cr.mts";
import cz from "./cz.mts";
import dk from "./dk.mts";
import ee from "./ee.mts";
import hu from "./hu.mts";
import ie from "./ie.mts";
import il from "./il.mts";
import is from "./is.mts";
import lt from "./lt.mts";
import lu from "./lu.mts";
import lv from "./lv.mts";
import pt from "./pt.mts";
import si from "./si.mts";
import sk from "./sk.mts";
import ae from "./ae.mts";
import by from "./by.mts";
import et from "./et.mts";
import ir from "./ir.mts";
import kz from "./kz.mts";
import ng from "./ng.mts";
import uz from "./uz.mts";
import vn from "./vn.mts";
import ro from "./ro.mts";
import bg from "./bg.mts";
import hr from "./hr.mts";
import cy from "./cy.mts";
import mt from "./mt.mts";
import sg from "./sg.mts";
import ph from "./ph.mts";
import mm from "./mm.mts";
import kh from "./kh.mts";
import la from "./la.mts";
import bn from "./bn.mts";
import tl from "./tl.mts";
import dz from "./dz.mts";
import ma from "./ma.mts";
import ke from "./ke.mts";
import gh from "./gh.mts";
import tz from "./tz.mts";
import ug from "./ug.mts";
import tn from "./tn.mts";
import ao from "./ao.mts";
import ci from "./ci.mts";
import cm from "./cm.mts";
import sn from "./sn.mts";
import zm from "./zm.mts";
import zw from "./zw.mts";
import mz from "./mz.mts";
import sd from "./sd.mts";
import cd from "./cd.mts";
import { loadCountries } from "../lib/countries.mts";
import { researchUniversities } from "./openalex.mts";
import { largestCities } from "./geonames.mts";
import { regionPopulation } from "./wikidata.mts";
import type { Pipeline } from "../lib/types.mts";

/** Rankings that exist only inside one country, one module per country (see lib.mts for the helpers). */
const WITH_PAGES: Pipeline[] = [...kr, ...jp, ...cn, ...india, ...de, ...gb, ...fr, ...it, ...es, ...ca, ...au, ...br, ...mx, ...ru, ...ch, ...id, ...nl, ...pl, ...se, ...tr, ...ar, ...my, ...sa, ...th, ...za, ...at, ...be, ...eg, ...fi, ...gr, ...no, ...nz, ...pk, ...ua, ...cl, ...co, ...cr, ...cz, ...dk, ...ee, ...hu, ...ie, ...il, ...is, ...lt, ...lu, ...lv, ...pt, ...si, ...sk, ...ae, ...by, ...et, ...ir, ...kz, ...ng, ...uz, ...vn, ...ro, ...bg, ...hr, ...cy, ...mt, ...sg, ...ph, ...mm, ...kh, ...la, ...bn, ...tl, ...dz, ...ma, ...ke, ...gh, ...tz, ...ug, ...tn, ...ao, ...ci, ...cm, ...sn, ...zm, ...zw, ...mz, ...sd, ...cd];

/**
 * Every independent country gets an OpenAlex "top research universities" ranking, except the US (College Scorecard
 * covers it) and the countries listed in NO_UNIVERSITIES, where OpenAlex knows fewer than five universities.
 */
const NO_UNIVERSITIES = new Set<string>(["AD","AG","BS","BT","BZ","CF","CG","CV","DJ","DM","ER","FJ","FM","GD","GM","GQ","GW","GY","KI","KM","KN","LI","LS","MC","MH","MV","NR","PW","SB","SC","SM","SR","ST","SZ","TO","TV","VA","VC","VU","WS"]);
const UNIVERSITY_COUNTRIES = loadCountries()
  .all.filter((c) => c.independent && c.code !== "US" && !NO_UNIVERSITIES.has(c.code))
  .map((c) => c.code);

/** Countries where GeoNames knows fewer than five cities of 15,000+ people. */
const NO_CITIES = new Set<string>(["AD","AG","BB","BS","BT","CV","DM","FM","GD","GY","KI","KM","KN","LC","LI","MC","MH","MV","NR","PW","SC","SM","ST","SZ","TO","TV","VA","VC","VU","WS"]);
const hasCities = new Set(WITH_PAGES.filter((p) => p.meta.short === "Cities").map((p) => p.meta.scope));
/** Every other independent country gets GeoNames' largest cities (the US has its own city ranking). */
const CITY_COUNTRIES = loadCountries()
  .all.filter((c) => c.independent && c.code !== "US" && !NO_CITIES.has(c.code) && !hasCities.has(c.code))
  .map((c) => c.code);

/** Countries whose Wikipedia articles have no regional table but where Wikidata has at least five populated divisions. */
const WIKIDATA_REGIONS = ["BW", "CF", "TD", "CG", "LS", "LR", "MU", "NA", "NE", "ML", "MR", "SS", "GA", "RW", "SL", "TG"];

export const REGIONAL: Pipeline[] = [
  ...WITH_PAGES,
  ...largestCities(CITY_COUNTRIES),
  ...regionPopulation(WIKIDATA_REGIONS),
  ...researchUniversities(UNIVERSITY_COUNTRIES),
];
