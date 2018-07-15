
var MAIN_ET		= "stories";

function genesis () {
    return true;
}

function json( d, f ) {
    return JSON.stringify( d, null, f === undefined ? 4 : f );
}
function log() {
    debug( Date() +' - '+ MAIN_ET +'/zome.js: '+ [].slice.call(arguments).join(' ') );
}

function validateCommit (entry_type, entry, header, pkg, sources) {
    log("Validate commit for type", entry_type, json(entry) );

    if ( entry_type == MAIN_ET ) {
	if (! call( "codeLibrary", "is_dict", entry ) )
	    return false;

	log("Check entry attributes");
	
	if (! ( entry.title	&&
		entry.as	&&
		entry.feature	&&
		entry.reason ))
	    return false;

	log("Passed");
	return true
    } else
	return true;
}
function validatePut (entry_type, entry, header, pkg, sources) {
    return true;
}
function validateMod (entry_type, entry, header, replaces, pkg, sources) {
    if ( entry_type == MAIN_ET ) {
	return validateCommit(entry_type, entry, header, pkg, sources);
    }
    else
	return true;
}
function validateDel (entry_type, hash, pkg, sources) {
    return true;
}


function write( data ) {
    log( "Write input", data );
    var hash			= commit( MAIN_ET, data );
    log( hash );
    return hash;
}

function getAll() {
    var result			= query({
	Return: {
	    Hashes: true,
	    Entries: true
	},
	Constrain: {
	    EntryTypes: [MAIN_ET]
	}
    });

    return json(result, 0);
}

function getSingle( hash ) {
    log("Get data for hash", hash);
    var data			= get( hash );
    log("Got data", data);
    return json(data, 0);
}

function updateItem( input ) {
    var prevHash		= input.hash;
    var data			= input.data;
    log("Update commit", prevHash, data);
    var hash			= update( MAIN_ET, data, prevHash );
    log("Updated hash", hash);
    return hash;
}

function archive( hash ) {
    log("Remove hash", hash);
    var hash			= remove( hash, "Archive story" );
    log("Success result", hash);
    return hash;
}
